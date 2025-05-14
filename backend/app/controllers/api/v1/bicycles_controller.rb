class Api::V1::BicyclesController < ApplicationController
  # Removed :update, :destroy, :my_bicycles, :mark_as_sold, :toggle_favorite, :get_favorites, :create_draft, :get_drafts, :publish_draft from :only as they are not yet implemented or their auth requirements might differ.
  # Add them back as they are implemented.
  before_action :authenticate_user!, only: [:create, :me, :update, :destroy] # 假設 update/destroy 也需要驗證
  before_action :set_bicycle, only: [:show, :update, :destroy] # 更新 :only 選項

  # POST /api/v1/bicycles
  def create
    # 1. 保留您原有的 bicycle_attributes 處理邏輯
    Rails.logger.info "!!!!!#{ENV["FRONTEND_URL"]}"
    bicycle_attributes = bicycle_params_for_create.to_h
    
    # 移除 seller_id 並設置 user_id (這部分邏輯可能需要調整，因為通常 user_id 應該來自 @current_user)
    # 如果 seller_id 是前端傳來且您希望用它來指定 bicycle 的 user_id (擁有者)，
    # 並且這個 seller_id 不一定是 @current_user，那麼這裡的邏輯需要釐清。
    # 通常情況下，創建資源的 user_id 應該是 @current_user.id。
    # 如果您希望 `seller_id` 參數用來設定 `user_id`，可以這樣：
    # bicycle_attributes[:user_id] = bicycle_attributes.delete(:seller_id) if bicycle_attributes[:seller_id].present?
    # 但更常見的是：
    # bicycle_attributes[:user_id] = @current_user.id (這已在 build 中處理)
    # 我將暫時註解掉 seller_id 的直接刪除，因為 build(@current_user.bicycles) 會處理 user_id
    # if bicycle_attributes[:seller_id].present?
    #   bicycle_attributes.delete(:seller_id)
    # end
    
    if params.dig(:bicycle, :specifications).is_a?(String)
      begin
        bicycle_attributes[:specifications] = JSON.parse(params[:bicycle][:specifications])
      rescue JSON::ParserError
        # 如果解析失敗，可以設定為空 Hash 或讓 validation 處理
        bicycle_attributes[:specifications] = {}
        Rails.logger.warn "Failed to parse specifications JSON: #{params[:bicycle][:specifications]}"
      end
    end

    # 2. 使用 @current_user 來 build bicycle，這會自動設定 user_id
    @bicycle = @current_user.bicycles.build(bicycle_attributes)
    

    # 3. 處理照片上傳 (這部分您原有的邏輯是直接 attach，也可以使用 ImageUploadService)
    # 為了與 ImageUploadService 的建議保持一致，這裡可以替換，但先保留您原有的：
    if params.dig(:bicycle, :photos).present?
      # 確保 photos 是陣列以防單一檔案上傳錯誤
      Array(params[:bicycle][:photos]).each do |photo|
        @bicycle.photos.attach(photo)
      end
    end

    if @bicycle.save
      # 4. 儲存成功後，使用 BicycleSerializer
      render json: BicycleSerializer.new(@bicycle).serializable_hash, status: :created
    else
      render json: { errors: @bicycle.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    # @bicycle 由 set_bicycle before_action 設定
    if @bicycle.user != @current_user # 權限檢查：確保只有物品擁有者可以更新
      render json: { error: "Not authorized to update this bicycle" }, status: :forbidden
      return
    end

    # 處理 bicycle_params_for_update，類似 create 中的 specifications
    update_attributes = bicycle_params_for_update.to_h
    if params.dig(:bicycle, :specifications).is_a?(String)
      begin
        update_attributes[:specifications] = JSON.parse(params[:bicycle][:specifications])
      rescue JSON::ParserError
        update_attributes[:specifications] = @bicycle.specifications # 保留舊的或設為nil/空
        Rails.logger.warn "Failed to parse specifications JSON during update: #{params[:bicycle][:specifications]}"
      end
    end

    if @bicycle.update(update_attributes)
      # 處理圖片更新/替換
      if params.dig(:bicycle, :photos).present?
        # 選項1: 清除所有舊圖片再附加新的 (完全替換)
        # @bicycle.photos.purge 
        # Array(params[:bicycle][:photos]).each { |photo| @bicycle.photos.attach(photo) }

        # 選項2: 只附加新的圖片 (追加，如果前端允許管理已有的圖片則更靈活)
        # 這裡我們假設是追加，如果需要替換，前端應先發送請求刪除舊圖片
        Array(params[:bicycle][:photos]).each do |photo|
          @bicycle.photos.attach(photo) # ImageUploadService 也可以用在這裡
        end
        # 注意：如果 Active Storage Direct Uploads 被使用，這裡的處理會不同
      end
      render json: BicycleSerializer.new(@bicycle.reload).serializable_hash # reload 以獲取最新的附件狀態
    else
      render json: { errors: @bicycle.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    # @bicycle 由 set_bicycle before_action 設定
    if @bicycle.user != @current_user # 權限檢查：確保只有物品擁有者可以刪除
      render json: { error: "Not authorized to delete this bicycle" }, status: :forbidden
      return
    end

    if @bicycle.destroy
      head :no_content # 成功刪除，回傳 204 No Content
    else
      # 理論上，如果 set_bicycle 成功，destroy 失敗的情況較少見，除非有回呼阻止
      render json: { errors: @bicycle.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    # @bicycle 由 set_bicycle before_action 設定
    # 設定 jsonapi-serializer 的選項 (如果需要)
    options = {}
    # options[:include] = [:seller_info] # 如果您想包含賣家資訊 (前提是 Serializer 中有 seller_info 且 Bicycle model 有 seller 關聯)
    # options[:fields] = { bicycle: [:id, :title, :main_photo_webp_url] } # 如果只想回傳特定欄位

    render json: BicycleSerializer.new(@bicycle, options).serializable_hash
  end

  # GET /api/v1/bicycles
  def index
    # 保留您原有的分頁和過濾邏輯
    page = params.fetch(:page, 1).to_i
    limit = params.fetch(:limit, 20).to_i
    offset = (page - 1) * limit

    @bicycles_query = Bicycle.includes(:user, photos_attachments: :blob).order(created_at: :desc)

    if params[:search].present?
      search_term = "%#{params[:search]}%"
      @bicycles_query = @bicycles_query.where("title ILIKE :search OR description ILIKE :search", search: search_term)
    end
    if params[:bike_type].present?
      @bicycles_query = @bicycles_query.where(bike_type: params[:bike_type].is_a?(Array) ? params[:bike_type] : [params[:bike_type]])
    end
    if params[:condition].present?
      @bicycles_query = @bicycles_query.where(condition: params[:condition].is_a?(Array) ? params[:condition] : [params[:condition]])
    end
    if params[:price_min].present?
      @bicycles_query = @bicycles_query.where("price >= ?", params[:price_min].to_f)
    end
    if params[:price_max].present? && params[:price_max].to_f > 0
      @bicycles_query = @bicycles_query.where("price <= ?", params[:price_max].to_f)
    end
    if params[:location].present?
      @bicycles_query = @bicycles_query.where("location ILIKE ?", "%#{params[:location]}%")
    end
    if params[:brand].present?
      @bicycles_query = @bicycles_query.where("brand ILIKE ?", params[:brand].is_a?(Array) ? params[:brand].first : params[:brand]) # 簡化品牌查詢，或根據需求調整
    end
    
    total_count = @bicycles_query.count
    @bicycles = @bicycles_query.offset(offset).limit(limit)
    
    # 使用 BicycleSerializer
    options = {}
    # options[:include] = [:seller_info] # 可選
    # options[:meta] = { total_count: total_count, current_page: page, limit: limit, total_pages: (total_count.to_f / limit).ceil }
    # 根據您的 Serializer 和前端需求調整 meta

    # 如果您希望最終的 JSON 結構仍然是 { bicycles: [...], totalCount: ... }
    # 您需要手動建構這個 Hash，或者調整前端以適應 JSON:API 格式
    serialized_bicycles = BicycleSerializer.new(@bicycles, options).serializable_hash

    render json: {
      bicycles: serialized_bicycles[:data].map { |item| item[:attributes].merge(id: item[:id]) }, # 轉換回您之前的扁平結構
      total_count: total_count,
      page: page,
      limit: limit,
      total_pages: (total_count.to_f / limit).ceil
    }
  end

  # GET /api/v1/bicycles/me
  def me
    page = params.fetch(:page, 1).to_i
    limit = params.fetch(:limit, 8).to_i
    offset = (page - 1) * limit

    # 確保預先載入 User 和 Photos
    all_user_bicycles = @current_user.bicycles.includes(:user, photos_attachments: :blob).order(created_at: :desc)
    @user_bicycles = all_user_bicycles.offset(offset).limit(limit)
    total_count = all_user_bicycles.count

    options = {}
    # options[:include] = [:seller_info] # current_user 的 bicycles，seller_info 就是 current_user 自己
    # options[:meta] = { total_count: total_count, current_page: page, limit: limit, total_pages: (total_count.to_f / limit).ceil }
    
    serialized_bicycles = BicycleSerializer.new(@user_bicycles, options).serializable_hash

    render json: {
      bicycles: serialized_bicycles[:data].map { |item| item[:attributes].merge(id: item[:id]) },
      total_count: total_count,
      page: page,
      limit: limit,
      total_pages: (total_count.to_f / limit).ceil
    }
  end

  private

  def set_bicycle
    # 預先載入附件和關聯的 user (seller)
    # 假設您的 Bicycle model 中有關聯: belongs_to :user 或 belongs_to :seller, class_name: 'User'
    @bicycle = Bicycle.includes(:user, photos_attachments: :blob).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Bicycle not found" }, status: :not_found
  end

  def bicycle_params_for_create
    # 確保 photos: [] 在 permit 中
    # seller_id 應該是 user_id，如果前端傳 seller_id 意指 user_id，則 permit :seller_id
    # 但通常情況下，user_id 由 @current_user 設定，所以不需要從 params 獲取
    params.require(:bicycle).permit(
      :title, :brand, :model, :year, :bike_type, :frame_size,
      :description, :condition, :price, :location, :contact_method, :status,
      # :seller_id, # 如果您確實需要前端傳遞並設定 user_id，則取消註解
      specifications: {},
      photos: []
    )
  end

  def bicycle_params_for_update
    # 與 create 類似，但可能不需要 user_id (因為 bicycle 已經存在且有擁有者)
    params.require(:bicycle).permit(
      :title, :brand, :model, :year, :bike_type, :frame_size,
      :description, :condition, :price, :location, :contact_method, :status,
      specifications: {},
      photos: [] # 允許 photos 以便可以更新或添加圖片
    )
  end

  # Add other actions (index, show, update, destroy, etc.) here as needed
end