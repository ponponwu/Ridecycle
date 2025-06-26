# frozen_string_literal: true

class MessageService
  include ActiveModel::Model
  include ActiveModel::Attributes

  # 服務結果物件
  class Result
    attr_reader :data, :errors, :status

    def initialize(success: false, data: nil, errors: [], status: :ok)
      @success = success
      @data = data
      @errors = Array(errors)
      @status = status
    end

    def success?
      @success
    end

    def failure?
      !@success
    end
  end

  class << self
    # 獲取對話列表 (優化版)
    def get_conversations(current_user)
      # 使用子查詢和 ROW_NUMBER() 一次性獲取每個對話的最後一則訊息
      last_message_subquery = Message
        .select("*, ROW_NUMBER() OVER(PARTITION BY LEAST(sender_id, recipient_id), GREATEST(sender_id, recipient_id) ORDER BY created_at DESC) as rn")
        .where("sender_id = :user_id OR recipient_id = :user_id", user_id: current_user.id)
        .to_sql

      # 找出所有與當前用戶相關的最新訊息
      last_messages = Message
        .from("(#{last_message_subquery}) AS messages")
        .where("rn = 1")
        .includes(:sender, :recipient, bicycle: [{ photos_attachments: :blob }, :brand]) # 預載所需關聯
        .order(created_at: :desc)
      
      # 建立對話預覽
      build_conversation_previews(last_messages, current_user)
    end

    # 獲取與特定用戶的對話訊息
    def get_conversation_messages(current_user, other_user_id)
      return [] unless other_user_id.present?
      
      other_user_id = other_user_id.to_i

      # 使用 ActiveRecord 查詢兩個用戶間的所有訊息
      messages = Message.where(
        build_conversation_condition,
        current_user_id: current_user.id, 
        other_user_id: other_user_id
      ).includes(
        :sender, 
        :recipient, 
        bicycle: [:brand, { photos_attachments: :blob }] # 加上 brand
      ).order(:created_at)

      # 標記未讀訊息為已讀
      mark_messages_as_read(messages, current_user.id, other_user_id)

      messages
    end

    # 創建訊息
    def create_message(current_user, message_params)
      # 驗證基本規則
      validation_result = validate_message_creation(current_user, message_params)
      return validation_result if validation_result.failure?

      # 建立訊息
      message = current_user.sent_messages.build(message_params)
      
      # 處理出價訊息的特殊邏輯
      handle_offer_message(message) if message.is_offer?

      if message.save
        Result.new(success: true, data: message)
      else
        Result.new(
          success: false, 
          errors: message.errors.full_messages, 
          status: :unprocessable_entity
        )
      end
    end

    private

    # 建立對話預覽 (優化版)
    def build_conversation_previews(last_messages, current_user)
      last_messages.map do |last_message|
        other_user = last_message.sender_id == current_user.id ? last_message.recipient : last_message.sender

        {
          with_user: {
            id: other_user.id,
            name: other_user.name,
            avatar: other_user.try(:avatar_url)
          },
          last_message: build_last_message_preview(last_message, current_user),
          updated_at: last_message.created_at,
          bicycle_id: last_message.bicycle_id,
          bicycle_title: last_message.bicycle&.title,
          bicycle_image_url: get_bicycle_image_url(last_message)
        }
      end
    end

    # 建立對話條件的 SQL 字串
    def build_conversation_condition
      <<-SQL.squish
        (sender_id = :current_user_id AND recipient_id = :other_user_id) OR 
        (sender_id = :other_user_id AND recipient_id = :current_user_id)
      SQL
    end

    # 標記訊息為已讀
    def mark_messages_as_read(messages, current_user_id, other_user_id)
      # 篩選出未讀的訊息
      unread_messages = messages.select do |msg|
        msg.sender_id == other_user_id && 
        msg.recipient_id == current_user_id && 
        !msg.is_read
      end

      return if unread_messages.empty?

      unread_ids = unread_messages.map(&:id)
      current_time = Time.current

      # 批次更新資料庫
      Message.where(id: unread_ids).update_all(
        is_read: true,
        read_at: current_time
      )

      # 同步記憶體中的物件狀態
      unread_messages.each do |message|
        message.is_read = true
        message.read_at = current_time
      end
    end

    # 建立最後一則訊息預覽
    def build_last_message_preview(message, current_user)
      return nil unless message

      {
        content: message.content.truncate(50),
        created_at: message.created_at,
        is_read: message.sender_id == current_user.id || 
                (message.recipient_id == current_user.id && message.is_read),
        sender_id: message.sender_id
      }
    end

    # 獲取腳踏車圖片 URL
    def get_bicycle_image_url(message)
      return nil unless message&.bicycle&.photos&.attached? && message.bicycle.photos.first
      
      Rails.application.routes.url_helpers.url_for(message.bicycle.photos.first)
    end

    # 驗證訊息創建
    def validate_message_creation(current_user, message_params)
      # 不能發送訊息給自己
      if message_params[:recipient_id].to_i == current_user.id
        return Result.new(
          success: false,
          errors: ["不能發送訊息給自己"],
          status: :unprocessable_entity
        )
      end

      # 檢查是否對自己的腳踏車留言
      if message_params[:bicycle_id].present?
        bicycle = Bicycle.find_by(id: message_params[:bicycle_id])
        if bicycle&.user_id == current_user.id
          return Result.new(
            success: false,
            errors: ["不能對自己發布的腳踏車留言"],
            status: :unprocessable_entity
          )
        end
      end

      # 如果是出價訊息，進行額外驗證
      if is_offer?(message_params)
        offer_validation = validate_offer_creation(current_user, message_params)
        return offer_validation if offer_validation.failure?
      end

      Result.new(success: true)
    end

    # 驗證出價創建
    def validate_offer_creation(current_user, message_params)
      recipient_id = message_params[:recipient_id]
      bicycle_id = message_params[:bicycle_id]

      # 檢查腳踏車
      bicycle = Bicycle.find_by(id: bicycle_id)
      unless bicycle
        return Result.new(
          success: false,
          errors: ["腳踏車不存在"],
          status: :not_found
        )
      end

      # 不能對自己的腳踏車出價（使用一致的錯誤訊息）
      if bicycle.user_id == current_user.id
        return Result.new(
          success: false,
          errors: ["不能對自己發布的腳踏車留言"],
          status: :unprocessable_entity
        )
      end

      # 檢查腳踏車是否可用
      unless bicycle.status == 'available'
        return Result.new(
          success: false,
          errors: ["此腳踏車已不可購買"],
          status: :unprocessable_entity
        )
      end

      # 檢查是否有待回應的出價
      if Message.has_pending_offer?(current_user.id, recipient_id, bicycle_id)
        latest_offer = Message.latest_offer_for(current_user.id, recipient_id, bicycle_id)
        
        return Result.new(
          success: false,
          errors: ["您已經有一個待回應的出價，請等待對方回應或先撤回之前的出價"],
          status: :unprocessable_entity,
          data: {
            existing_offer: {
              id: latest_offer.id,
              amount: latest_offer.offer_amount,
              status: latest_offer.offer_status,
              created_at: latest_offer.created_at
            }
          }
        )
      end

      Result.new(success: true)
    end

    # 處理出價訊息
    def handle_offer_message(message)
      return unless message.offer_amount.present?

      formatted_amount = "NT$#{message.offer_amount.to_i.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}"
      
      # 如果內容沒有包含出價資訊，自動添加
      unless message.content.include?('offer') || message.content.include?('出價')
        message.content = "出價: #{formatted_amount}"
      end
    end

    # 檢查是否為出價訊息
    def is_offer?(message_params)
      message_params[:is_offer] == 'true' || message_params[:is_offer] == true
    end
  end
end