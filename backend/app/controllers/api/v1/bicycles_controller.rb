# API controller for managing bicycle listings
# Handles CRUD operations for bicycles in the marketplace
#
# @author RideCycle Team
# @since 1.0.0
class Api::V1::BicyclesController < ApplicationController
  # Authentication required for creating, viewing own bicycles, updating, and deleting
  before_action :authenticate_user!, only: [:create, :me, :update, :destroy]
  
  # Set bicycle instance for actions that need a specific bicycle
  before_action :set_bicycle, only: [:show, :update, :destroy]

  # Creates a new bicycle listing
  # 
  # @api public
  # @example POST /api/v1/bicycles
  # @param [Hash] bicycle The bicycle parameters
  # @option bicycle [String] :title The title of the bicycle listing
  # @option bicycle [String] :description Detailed description
  # @option bicycle [Numeric] :price The price of the bicycle
  # @option bicycle [String] :condition The condition (brand_new, like_new, excellent, good, fair)
  # @option bicycle [String] :bicycle_type The type of bicycle
  # @option bicycle [String] :frame_size The frame size
  # @option bicycle [String] :location The location
  # @option bicycle [Array<File>] :photos Array of photo files (optional)
  # @return [JSON] The created bicycle in JSON:API format
  # @return [JSON] Error messages if validation fails
  def create
    Rails.logger.info "Creating bicycle for user: #{@current_user.id}"
    
    # Extract photo files from params
    photo_files = params.dig(:bicycle, :photos).present? ? Array(params[:bicycle][:photos]) : []
    
    # Use BicycleCreationService to handle bicycle creation
    service = BicycleCreationService.new(@current_user, bicycle_params_for_create, photo_files)
    
    unless service.valid?
      render json: { 
        success: false, 
        errors: ['Invalid parameters provided'] 
      }, status: :bad_request
      return
    end

    begin
      @bicycle = service.call
      render json: BicycleSerializer.new(@bicycle).serializable_hash, status: :created
    rescue ActiveRecord::RecordInvalid => e
      render json: { 
        success: false, 
        errors: e.record.errors.full_messages 
      }, status: :unprocessable_entity
    rescue StandardError => e
      Rails.logger.error "Bicycle creation failed: #{e.message}"
      render json: { 
        success: false, 
        errors: ['Failed to create bicycle'] 
      }, status: :internal_server_error
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
    # if params.dig(:bicycle, :specifications).is_a?(String)
    #   begin
    #     update_attributes[:specifications] = JSON.parse(params[:bicycle][:specifications])
    #   rescue JSON::ParserError
    #     update_attributes[:specifications] = @bicycle.specifications # 保留舊的或設為nil/空
    #     Rails.logger.warn "Failed to parse specifications JSON during update: #{params[:bicycle][:specifications]}"
    #   end
    # end

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
      # 回傳標準的 JSON:API 格式
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

    # 回傳標準的 JSON:API 格式
    render json: BicycleSerializer.new(@bicycle, options).serializable_hash
  end

  # Lists all bicycles with filtering and pagination
  # 
  # @api public
  # @example GET /api/v1/bicycles?search=trek&bicycle_type=road&page=1&limit=20
  # @param [String] search Search term for title and description (optional)
  # @param [String,Array<String>] bicycle_type Filter by bicycle type (optional)
  # @param [String,Array<String>] condition Filter by condition (optional)
  # @param [Numeric] price_min Minimum price filter (optional)
  # @param [Numeric] price_max Maximum price filter (optional)
  # @param [String] location Location filter (optional)
  # @param [String] brand Brand filter (optional)
  # @param [String] sort Sort order: newest, price_low, price_high, popular (optional)
  # @param [Integer] page Page number for pagination (default: 1)
  # @param [Integer] limit Items per page (default: 20)
  # @return [JSON] Paginated list of bicycles in JSON:API format with metadata
  def index
    # Use BicycleSearchService to handle complex search logic
    search_service = BicycleSearchService.new(params.to_unsafe_h)
    result = search_service.call
    
    # Serialize the results
    serialized_bicycles = BicycleSerializer.new(result[:bicycles]).serializable_hash

    # Return standard JSON:API format with pagination metadata
    render json: {
      data: serialized_bicycles[:data],
      meta: {
        total_count: result[:total_count],
        current_page: result[:current_page],
        per_page: result[:per_page],
        total_pages: result[:total_pages]
      }
    }
  end

  # GET /api/v1/bicycles/me
  def me
    page = params.fetch(:page, 1).to_i
    limit = params.fetch(:limit, 8).to_i
    offset = (page - 1) * limit

    # 確保預先載入 User、Brand 和 Photos
    all_user_bicycles = @current_user.bicycles.includes(:user, :brand, photos_attachments: :blob).order(created_at: :desc)
    @user_bicycles = all_user_bicycles.offset(offset).limit(limit)
    total_count = all_user_bicycles.count

    options = {}
    # options[:include] = [:seller_info] # current_user 的 bicycles，seller_info 就是 current_user 自己
    # options[:meta] = { total_count: total_count, current_page: page, limit: limit, total_pages: (total_count.to_f / limit).ceil }
    
    serialized_bicycles = BicycleSerializer.new(@user_bicycles, options).serializable_hash

    # 回傳標準的 JSON:API 格式
    render json: {
      data: serialized_bicycles[:data],
      meta: {
        total_count: total_count,
        current_page: page,
        per_page: limit,
        total_pages: (total_count.to_f / limit).ceil
      }
    }
  end

  # GET /api/v1/bicycles/featured
  def featured
    limit = params.fetch(:limit, 4).to_i
    
    # 特色自行車的邏輯：可以是價格較高、狀況較好、或者有特殊標記的自行車
    # 這裡我們選擇狀況為 'excellent' 或 'like_new' 且價格較高的自行車
    @featured_bicycles = Bicycle.includes(:user, :brand, photos_attachments: :blob)
                                .where(condition: ['brand_new', 'like_new'])
                                .order(price: :desc, created_at: :desc)
                                .limit(limit)
    
    options = {}
    serialized_bicycles = BicycleSerializer.new(@featured_bicycles, options).serializable_hash
    
    render json: {
      data: serialized_bicycles[:data]
    }
  end

  # GET /api/v1/bicycles/recently_added
  def recently_added
    limit = params.fetch(:limit, 4).to_i
    
    # 最近新增的自行車：按創建時間排序
    @recent_bicycles = Bicycle.includes(:user, :brand, photos_attachments: :blob)
                              .order(created_at: :desc)
                              .limit(limit)
    
    options = {}
    serialized_bicycles = BicycleSerializer.new(@recent_bicycles, options).serializable_hash
    
    render json: {
      data: serialized_bicycles[:data]
    }
  end

  private

  def set_bicycle
    # 預先載入附件和關聯的 user (seller)
    # 假設您的 Bicycle model 中有關聯: belongs_to :user 或 belongs_to :seller, class_name: 'User'
    @bicycle = Bicycle.includes(:user, :brand, photos_attachments: :blob).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Bicycle not found" }, status: :not_found
  end

  def bicycle_params_for_create
    # 確保 photos: [] 在 permit 中
    # seller_id 應該是 user_id，如果前端傳 seller_id 意指 user_id，則 permit :seller_id
    # 但通常情況下，user_id 由 @current_user 設定，所以不需要從 params 獲取
    params.require(:bicycle).permit(
      :title, :model, :year, :bicycle_type, :brand_id, :bicycle_model_id, :frame_size, :transmission_id,
      :description, :condition, :price, :location, :contact_method, :status,
      # :seller_id, # 如果您確實需要前端傳遞並設定 user_id，則取消註解
      specifications: {},
      photos: []
    )
  end

  def bicycle_params_for_update
    # 與 create 類似，但可能不需要 user_id (因為 bicycle 已經存在且有擁有者)
    params.require(:bicycle).permit(
      :title, :model, :year, :bicycle_type, :brand_id, :bicycle_model_id, :frame_size, :transmission_id,
      :description, :condition, :price, :location, :contact_method, :status,
      specifications: {},
      photos: [] # 允許 photos 以便可以更新或添加圖片
    )
  end

  # Add other actions (index, show, update, destroy, etc.) here as needed
end