class Api::V1::BicyclesController < ApplicationController
  # Removed :update, :destroy, :my_bicycles, :mark_as_sold, :toggle_favorite, :get_favorites, :create_draft, :get_drafts, :publish_draft from :only as they are not yet implemented or their auth requirements might differ.
  # Add them back as they are implemented.
  before_action :authenticate_user!, only: [:create, :me] # Added :me to protected actions
  before_action :set_bicycle, only: [:show] # Add :update, :destroy when implemented

  # POST /api/v1/bicycles
  def create
    # 創建參數哈希
    bicycle_attributes = bicycle_params_for_create.to_h
    
    # 移除 seller_id 並設置 user_id
    if bicycle_attributes[:seller_id].present?
      # 將 seller_id 移除，因為已經通過 current_user 來設置 user_id
      bicycle_attributes.delete(:seller_id)
    end
    
    # 處理 specifications 參數
    if params[:bicycle][:specifications].present?
      if params[:bicycle][:specifications].is_a?(String)
        begin
          bicycle_attributes[:specifications] = JSON.parse(params[:bicycle][:specifications])
        rescue JSON::ParserError
          bicycle_attributes[:specifications] = {}
        end
      end
    end

    # 創建自行車記錄
    @bicycle = @current_user.bicycles.build(bicycle_attributes)

    # 處理照片上傳
    if params[:bicycle][:photos].present?
      params[:bicycle][:photos].each do |photo|
        @bicycle.photos.attach(photo)
      end
    end

    if @bicycle.save
      render json: @bicycle, status: :created
    else
      render json: { errors: @bicycle.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    if @bicycle
      bicycle_data_snake = @bicycle.as_json(include: { user: { only: [:id, :name, :email] } })
      bicycle_data_camel = bicycle_data_snake.transform_keys { |key| key.camelize(:lower) }
      
      # Ensure user is also camelCased if present
      if bicycle_data_camel["user"] && bicycle_data_camel["user"].is_a?(Hash)
        bicycle_data_camel["user"] = bicycle_data_camel["user"].transform_keys { |key| key.camelize(:lower) }
      end

      bicycle_data_camel[:photos_urls] = @bicycle.photos.attached? ? @bicycle.photos.map { |photo| url_for(photo) } : [] # Corrected to photos_urls
      # Ensure keys from IBicycle like bikeType, frameSize are present and camelCased
      # as_json might not include all attributes or might use different names.
      # A more robust solution is a serializer or explicitly building the hash.
      # For now, we rely on transform_keys and ensure photos_urls is correctly cased.
      # If 'bike_type' from DB becomes 'bikeType' in bicycle_data_camel, it should work.
      render json: bicycle_data_camel
    else
      render json: { error: 'Bicycle not found' }, status: :not_found
    end
  end

  # GET /api/v1/bicycles
  def index
    # Basic pagination (can be enhanced with gems like kaminari or will_paginate)
    page = params.fetch(:page, 1).to_i
    limit = params.fetch(:limit, 20).to_i # Default to 20, can be overridden by params
    offset = (page - 1) * limit

    # Start with all bicycles and apply filters progressively
    @bicycles_query = Bicycle.includes(:user).with_attached_photos.order(created_at: :desc)

    # Search query (simple title/description search)
    if params[:search].present?
      search_term = "%#{params[:search]}%"
      @bicycles_query = @bicycles_query.where("title ILIKE :search OR description ILIKE :search", search: search_term)
    end

    # Filter by bike_type (can be an array)
    if params[:bike_type].present? && params[:bike_type].is_a?(Array)
      @bicycles_query = @bicycles_query.where(bike_type: params[:bike_type])
    elsif params[:bike_type].present? # Single bike_type
      @bicycles_query = @bicycles_query.where(bike_type: params[:bike_type])
    end
    
    # Filter by condition (can be an array)
    if params[:condition].present? && params[:condition].is_a?(Array)
      @bicycles_query = @bicycles_query.where(condition: params[:condition])
    elsif params[:condition].present? # Single condition
      @bicycles_query = @bicycles_query.where(condition: params[:condition])
    end

    # Filter by price range
    if params[:price_min].present?
      @bicycles_query = @bicycles_query.where("price >= ?", params[:price_min].to_f)
    end
    if params[:price_max].present? && params[:price_max].to_f > 0 # Ensure priceMax is positive
      @bicycles_query = @bicycles_query.where("price <= ?", params[:price_max].to_f)
    end

    # Filter by location (exact match for simplicity, can be made more flexible)
    if params[:location].present?
      @bicycles_query = @bicycles_query.where("location ILIKE ?", "%#{params[:location]}%")
    end

    # Filter by brand (can be an array)
    if params[:brand].present? && params[:brand].is_a?(Array)
      @bicycles_query = @bicycles_query.where(brand: params[:brand])
    elsif params[:brand].present? # Single brand
       @bicycles_query = @bicycles_query.where("brand ILIKE ?", params[:brand])
    end
    
    # Get total count after filtering for pagination
    total_count = @bicycles_query.count
    @bicycles = @bicycles_query.offset(offset).limit(limit)
    
    bicycles_with_details = @bicycles.map do |bicycle|
      bicycle_data_snake = bicycle.as_json(include: { user: { only: [:id, :name] } })
      bicycle_data_camel = bicycle_data_snake.transform_keys { |key| key.camelize(:lower) }
      if bicycle_data_camel["user"] && bicycle_data_camel["user"].is_a?(Hash)
        bicycle_data_camel["user"] = bicycle_data_camel["user"].transform_keys { |key| key.camelize(:lower) }
      end
      bicycle_data_camel[:photos_urls] = bicycle.photos.attached? ? bicycle.photos.map { |photo| url_for(photo) } : [] # Corrected to photos_urls
      bicycle_data_camel
    end
    
    render json: {
      bicycles: bicycles_with_details, # This now contains camelCase bicycle objects
      totalCount: total_count,
      page: page,
      limit: limit,
      totalPages: (total_count.to_f / limit).ceil
    }
  end

  # GET /api/v1/bicycles/me
  def me
    page = params.fetch(:page, 1).to_i
    limit = params.fetch(:limit, 8).to_i # Default to 8 items per page
    offset = (page - 1) * limit

    all_user_bicycles = @current_user.bicycles.includes(:user).with_attached_photos.order(created_at: :desc)
    @user_bicycles = all_user_bicycles.offset(offset).limit(limit)
    total_count = all_user_bicycles.count

    bicycles_with_details = @user_bicycles.map do |bicycle|
      # For /me endpoint, user info is still useful for consistency in the bicycle object structure.
      bicycle_data_snake = bicycle.as_json(include: { user: { only: [:id, :name] } })
      bicycle_data_camel = bicycle_data_snake.transform_keys { |key| key.camelize(:lower) }
      if bicycle_data_camel["user"] && bicycle_data_camel["user"].is_a?(Hash)
        bicycle_data_camel["user"] = bicycle_data_camel["user"].transform_keys { |key| key.camelize(:lower) }
      end
      bicycle_data_camel[:photos_urls] = bicycle.photos.attached? ? bicycle.photos.map { |photo| url_for(photo) } : [] # Corrected to photos_urls
      bicycle_data_camel
    end

    render json: {
      bicycles: bicycles_with_details, # This now contains camelCase bicycle objects
      totalCount: total_count,
      page: page,
      limit: limit,
      totalPages: (total_count.to_f / limit).ceil
    }
  end

  private

  def set_bicycle
    @bicycle = Bicycle.includes(:user, photos_attachments: :blob).find(params[:id])
  end

  def bicycle_params_for_create
    # Permit parameters in snake_case as expected by Rails model attributes
    params.require(:bicycle).permit(
      :title,
      :brand,
      :model,
      :year,
      :bike_type,
      :frame_size,
      :description,
      :condition,
      :price,
      :location,
      :contact_method,
      :status,
      :seller_id,
      specifications: {},
      photos: []
    )
  end

  # Add other actions (index, show, update, destroy, etc.) here as needed
end