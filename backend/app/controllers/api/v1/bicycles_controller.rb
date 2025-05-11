class Api::V1::BicyclesController < ApplicationController
  # Removed :update, :destroy, :my_bicycles, :mark_as_sold, :toggle_favorite, :get_favorites, :create_draft, :get_drafts, :publish_draft from :only as they are not yet implemented or their auth requirements might differ.
  # Add them back as they are implemented.
  before_action :authenticate_user!, only: [:create] # Assuming other actions might not all require auth or are not yet built
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
      bicycle_data = @bicycle.as_json(include: { user: { only: [:id, :name, :email] } })
      bicycle_data[:photos_urls] = @bicycle.photos.attached? ? @bicycle.photos.map { |photo| url_for(photo) } : []
      # Consider adding specifications if they are part of the Bicycle model or an association
      # bicycle_data[:specifications_data] = @bicycle.specifications if @bicycle.respond_to?(:specifications)
      render json: bicycle_data
    else
      render json: { error: 'Bicycle not found' }, status: :not_found
    end
  end

  # GET /api/v1/bicycles
  def index
    # Basic pagination (can be enhanced with gems like kaminari or will_paginate)
    page = params.fetch(:page, 1).to_i
    limit = params.fetch(:limit, 8).to_i # Default to 8 items per page, matching frontend request
    offset = (page - 1) * limit

    all_bicycles = Bicycle.includes(:user).with_attached_photos.order(created_at: :desc)
    @bicycles = all_bicycles.offset(offset).limit(limit)
    total_count = all_bicycles.count
    
    bicycles_with_details = @bicycles.map do |bicycle|
      bicycle_data = bicycle.as_json(include: { user: { only: [:id, :name] } })
      bicycle_data[:photos_urls] = bicycle.photos.attached? ? bicycle.photos.map { |photo| url_for(photo) } : []
      bicycle_data
    end
    
    render json: {
      bicycles: bicycles_with_details,
      totalCount: total_count,
      page: page,
      limit: limit,
      totalPages: (total_count.to_f / limit).ceil
    }
  end

  private

  def set_bicycle
    @bicycle = Bicycle.find(params[:id])
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