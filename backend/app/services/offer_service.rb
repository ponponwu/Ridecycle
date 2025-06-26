# frozen_string_literal: true

class OfferService
  include ActiveModel::Model
  include ActiveModel::Attributes

  # 使用與 MessageService 相同的 Result 類別
  Result = MessageService::Result

  class << self
    # 接受出價
    def accept_offer(message, current_user)
      # 驗證出價
      validation_result = validate_offer_action(message, current_user, 'accept')
      return validation_result if validation_result.failure?

      begin
        result_data = {}
        
        ActiveRecord::Base.transaction do
          # 接受出價
          message.accept_offer!
          result_data[:accepted_offer] = message
          
          # 更新腳踏車狀態
          message.bicycle.update!(status: :sold)
          
          # 創建訂單
          order = create_order(message)
          result_data[:order] = order
          
          # 創建回應訊息
          response_message = create_acceptance_response_message(message, current_user, order)
          result_data[:response_message] = response_message
        end

        # TODO: 發送郵件通知
        # NotificationMailer.offer_accepted(message.sender, result_data[:order]).deliver_later

        Result.new(success: true, data: result_data)
      rescue => e
        Rails.logger.error "接受出價時發生錯誤: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        
        Result.new(
          success: false,
          errors: ["接受出價時發生錯誤: #{e.message}"],
          status: :internal_server_error
        )
      end
    end

    # 拒絕出價
    def reject_offer(message, current_user)
      # 驗證出價
      validation_result = validate_offer_action(message, current_user, 'reject')
      return validation_result if validation_result.failure?

      begin
        result_data = {}
        
        ActiveRecord::Base.transaction do
          # 拒絕出價
          message.reject_offer!
          result_data[:rejected_offer] = message
          
          # 創建回應訊息
          response_message = create_rejection_response_message(message, current_user)
          result_data[:response_message] = response_message
        end

        Result.new(success: true, data: result_data)
      rescue => e
        Rails.logger.error "拒絕出價時發生錯誤: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        
        Result.new(
          success: false,
          errors: ["拒絕出價時發生錯誤: #{e.message}"],
          status: :internal_server_error
        )
      end
    end

    private

    # 驗證出價操作
    def validate_offer_action(message, current_user, action)
      # 檢查訊息是否存在
      unless message
        return Result.new(
          success: false,
          errors: ["出價訊息不存在"],
          status: :not_found
        )
      end

      # 檢查發送者是否存在
      unless message.sender
        return Result.new(
          success: false,
          errors: ["出價發送者不存在"],
          status: :unprocessable_entity
        )
      end

      # 檢查權限
      unless message.recipient_id == current_user.id
        action_text = action == 'accept' ? '接受' : '拒絕'
        return Result.new(
          success: false,
          errors: ["您沒有權限#{action_text}這個出價"],
          status: :forbidden
        )
      end

      # 檢查是否為有效的出價
      unless message.is_offer? && message.offer_pending?
        action_text = action == 'accept' ? '被接受' : '被拒絕'
        return Result.new(
          success: false,
          errors: ["這個出價無法#{action_text}"],
          status: :unprocessable_entity
        )
      end

      # 如果是接受出價，還需要檢查腳踏車狀態
      if action == 'accept' && message.bicycle.status != 'available'
        return Result.new(
          success: false,
          errors: ["腳踏車已不可購買"],
          status: :unprocessable_entity
        )
      end

      Result.new(success: true)
    end

    # 創建訂單
    def create_order(message)
      Order.create!(
        user: message.sender,
        bicycle: message.bicycle,
        total_price: message.offer_amount,
        status: :pending,
        payment_status: :pending
      )
    end

    # 創建接受出價的回應訊息
    def create_acceptance_response_message(message, current_user, order)
      content = build_acceptance_message_content(message, order)
      
      current_user.sent_messages.create!(
        recipient_id: message.sender.id,
        bicycle_id: message.bicycle_id,
        content: content
      )
    end

    # 創建拒絕出價的回應訊息
    def create_rejection_response_message(message, current_user)
      content = "很抱歉，我拒絕了您的出價 #{message.formatted_offer_amount}。"
      
      current_user.sent_messages.create!(
        recipient_id: message.sender.id,
        bicycle_id: message.bicycle_id,
        content: content
      )
    end

    # 建立接受出價的訊息內容
    def build_acceptance_message_content(message, order)
      base_message = "我接受了您的出價 #{message.formatted_offer_amount}！"
      order_info = "您的訂單編號是 #{order.order_number}。"
      instruction = "請聯繫我完成交易。"
      
      "#{base_message}#{order_info}#{instruction}"
    end
  end
end 