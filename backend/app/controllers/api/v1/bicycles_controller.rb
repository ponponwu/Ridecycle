# API controller for managing bicycle listings
# Handles CRUD operations for bicycles in the marketplace
#
# @author RideCycle Team
# @since 1.0.0
class Api::V1::BicyclesController < ApplicationController
  include BicyclePreloader # 引入共享的預載邏輯

  # Authentication required for creating, viewing own bicycles, updating, and deleting
  before_action :authenticate_user!, except: [:index, :show, :featured, :recently_added]
  
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
    begin
      bicycle_params = bicycle_params_for_create
      
      # 確保設置賣家為當前用戶
      bicycle_params = bicycle_params.merge(user_id: current_user.id)
      
      @bicycle = Bicycle.new(bicycle_params)
      
      if @bicycle.save
        # 處理照片上傳
        if params.dig(:bicycle, :photos).present?
          Array(params[:bicycle][:photos]).each do |photo|
            @bicycle.photos.attach(photo) if photo.present?
          end
        end
        
        render_jsonapi_resource(@bicycle, serializer: BicycleSerializer, status: :created)
      else
        render_jsonapi_errors(@bicycle.errors.full_messages)
      end
    rescue StandardError => e
      Rails.logger.error "Bicycle creation failed: #{e.message}"
      render_jsonapi_errors(['Failed to create bicycle'], status: :internal_server_error)
    end
  end

  def update
    # @bicycle 由 set_bicycle before_action 設定
    if @bicycle.user != current_user # 權限檢查：確保只有物品擁有者可以更新
      render_jsonapi_errors(['Not authorized to update this bicycle'], status: :forbidden, title: 'Forbidden')
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
      render_jsonapi_resource(@bicycle.reload, serializer: BicycleSerializer) # reload 以獲取最新的附件狀態
    else
      render_jsonapi_errors(@bicycle.errors.full_messages)
    end
  end

  def destroy
    # @bicycle 由 set_bicycle before_action 設定
    if @bicycle.user != current_user # 權限檢查：確保只有物品擁有者可以刪除
      render_jsonapi_errors(['Not authorized to delete this bicycle'], status: :forbidden, title: 'Forbidden')
      return
    end

    if @bicycle.destroy
      head :no_content # 成功刪除，回傳 204 No Content
    else
      # 理論上，如果 set_bicycle 成功，destroy 失敗的情況較少見，除非有回呼阻止
      render_jsonapi_errors(@bicycle.errors.full_messages)
    end
  end

  def show
    # @bicycle 由 set_bicycle before_action 設定
    # 設定 jsonapi-serializer 的選項，包含詳細視圖參數
    options = {
      params: { detailed_view: true }
    }

    # 回傳標準的 JSON:API 格式
    render_jsonapi_resource(@bicycle, serializer: BicycleSerializer, options: options)
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
    # 使用列表上下文的輕量級預載策略
    search_service = BicycleSearchService.new(search_params, [], 'list')
    result = search_service.call
    
    # Return standard JSON:API format with pagination metadata
    meta = {
      total_count: result[:total_count],
      current_page: result[:current_page],
      per_page: result[:per_page],
      total_pages: result[:total_pages]
    }

    render_jsonapi_collection(result[:bicycles], serializer: BicycleSerializer, meta: meta)
  end

  # GET /api/v1/bicycles/me
  def me
    bicycles = current_user.bicycles.includes(list_bicycle_includes)
    render_jsonapi_collection(bicycles, serializer: BicycleSerializer)
  end

  # GET /api/v1/bicycles/featured
  def featured
    limit = params[:limit]&.to_i || 4
    bicycles = Bicycle.includes(list_bicycle_includes)
                      .available
                      .order(created_at: :desc)
                      .limit(limit)
    
    render_jsonapi_collection(bicycles, serializer: BicycleSerializer)
  end

  # GET /api/v1/bicycles/recently_added
  def recently_added
    limit = params[:limit]&.to_i || 4
    bicycles = Bicycle.includes(list_bicycle_includes)
                      .available
                      .order(created_at: :desc)
                      .limit(limit)
    
    render_jsonapi_collection(bicycles, serializer: BicycleSerializer)
  end

  private

  def set_bicycle
    # 使用詳細頁面的完整預載策略
    @bicycle = Bicycle.includes(detail_bicycle_includes).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_jsonapi_errors(['Bicycle not found'], status: :not_found, title: 'Not Found')
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

  def search_params
    # First permit all possible parameters (including both old and new formats)
    raw_permitted = params.permit(:search, :page, :limit, :sort, :condition, :price, :type, :category,
                                  :price_min, :price_max, :location, :brand_id, :transmission_id,
                                  :frame_material, :year_min, :year_max, :color, :frameset_only,
                                  bicycle_type: [], condition: [], brand: [], status: [])
    
    # Then normalize parameters to handle different frontend formats
    normalized_params = normalize_search_params(raw_permitted)
    
    # Re-permit the normalized parameters to ensure they maintain permitted status
    final_permitted = ActionController::Parameters.new(normalized_params.to_h).permit(
      :search, :page, :limit, :sort, :condition,
      :price_min, :price_max, :location, :brand_id, :transmission_id,
      :frame_material, :year_min, :year_max, :color, :frameset_only,
      bicycle_type: [], condition: [], brand: [], status: []
    )
    
    # Validate and clean price parameters
    final_permitted = validate_price_params(final_permitted)
    
    Rails.logger.debug "Final processed search params: #{final_permitted.to_h}"
    final_permitted
  end
  
  # Validates and cleans price parameters for search
  # @param params [ActionController::Parameters] The permitted parameters
  # @return [ActionController::Parameters] Cleaned parameters
  def validate_price_params(params)
    # Clean price_min parameter
    if params[:price_min].present?
      clean_price = clean_price_input(params[:price_min])
      if clean_price.nil?
        Rails.logger.warn "Invalid price_min parameter: #{params[:price_min]}"
        params.delete(:price_min)
      else
        params[:price_min] = clean_price
      end
    end
    
    # Clean price_max parameter
    if params[:price_max].present?
      clean_price = clean_price_input(params[:price_max])
      if clean_price.nil?
        Rails.logger.warn "Invalid price_max parameter: #{params[:price_max]}"
        params.delete(:price_max)
      else
        params[:price_max] = clean_price
      end
    end
    
    # Validate price range logic
    if params[:price_min] && params[:price_max] && params[:price_min].to_f > params[:price_max].to_f
      Rails.logger.warn "Invalid price range: min (#{params[:price_min]}) > max (#{params[:price_max]})"
      params.delete(:price_min)
      params.delete(:price_max)
    end
    
    params
  end
  
  # Cleans and validates price input
  # @param price_input [String, Numeric] The price input to clean
  # @return [String, nil] Cleaned price string or nil if invalid
  def clean_price_input(price_input)
    return nil if price_input.blank?
    
    # Handle string inputs
    if price_input.is_a?(String)
      # Remove common currency symbols and whitespace, keep digits, dots, and hyphens
      clean_input = price_input.gsub(/[^\d.-]/, '')
      return nil if clean_input.blank?
    else
      clean_input = price_input.to_s
    end
    
    # Validate the cleaned input can be converted to a valid positive number
    begin
      price = Float(clean_input)
      return nil if price < 0
      clean_input
    rescue ArgumentError, TypeError
      nil
    end
  end
  
  # Normalizes search parameters to handle different frontend formats
  # @param params [ActionController::Parameters] Raw parameters from frontend
  # @return [ActionController::Parameters] Normalized parameters
  def normalize_search_params(params)
    normalized = params.dup
    
    # Handle price range format: price=30000-50000 -> price_min=30000, price_max=50000
    if params[:price].present?
      price_min, price_max = parse_price_range(params[:price])
      normalized[:price_min] = price_min if price_min
      normalized[:price_max] = price_max if price_max
      normalized.delete(:price)
    end
    
    # Handle parameter name mapping: type -> bicycle_type
    if params[:type].present?
      # Convert single type to array format for consistency
      normalized[:bicycle_type] = Array(params[:type])
      normalized.delete(:type)
    end
    
    # Handle other parameter aliases if needed
    if params[:category].present?
      normalized[:bicycle_type] = Array(params[:category])
      normalized.delete(:category)
    end
    
    Rails.logger.debug "Normalized params: #{normalized.to_unsafe_h.slice(:price_min, :price_max, :bicycle_type, :type, :price)}"
    normalized
  end
  
  # Parses price range string into min and max values
  # @param price_range [String] Price range in format "min-max", "min-", "-max", or "min+"
  # @return [Array<String, String>] Array containing [price_min, price_max]
  def parse_price_range(price_range)
    return [nil, nil] if price_range.blank?
    
    # Clean the input - remove currency symbols and whitespace, but keep +, -, and digits
    clean_range = price_range.to_s.gsub(/[^\d.+-]/, '')
    
    # Handle different formats:
    # "30000-50000" -> ["30000", "50000"]
    # "30000-" -> ["30000", nil]
    # "-50000" -> [nil, "50000"]
    # "300000+" -> ["300000", nil] (new format for "300000 and above")
    # "30000" -> ["30000", nil] (single value treated as minimum)
    
    if clean_range.end_with?('+')
      # Handle "300000+" format
      price_min = clean_range.chomp('+')
      price_max = nil
    elsif clean_range.include?('-')
      parts = clean_range.split('-', 2)
      price_min = parts[0].present? ? parts[0] : nil
      price_max = parts[1].present? ? parts[1] : nil
    else
      # Single value treated as minimum price
      price_min = clean_range.present? ? clean_range : nil
      price_max = nil
    end
    
    # Validate the parsed values
    price_min = validate_price_value(price_min)
    price_max = validate_price_value(price_max)
    
    Rails.logger.debug "Parsed price range '#{price_range}' -> min: #{price_min}, max: #{price_max}"
    [price_min, price_max]
  end
  
  # Validates a single price value
  # @param price_value [String, nil] Price value to validate
  # @return [String, nil] Valid price string or nil
  def validate_price_value(price_value)
    return nil if price_value.blank?
    
    begin
      price = Float(price_value)
      return nil if price < 0
      price_value
    rescue ArgumentError, TypeError
      Rails.logger.warn "Invalid price value in range: #{price_value}"
      nil
    end
  end

  # Add other actions (index, show, update, destroy, etc.) here as needed
end