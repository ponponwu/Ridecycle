# API controller for admin bicycle management
# Provides CRUD operations for administrators to manage bicycles
#
# @author RideCycle Team
# @since 1.0.0
class Api::V1::Admin::BicyclesController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_admin!
  before_action :set_bicycle, only: [:show, :update, :destroy, :approve, :reject]

  # GET /api/v1/admin/bicycles
  # Returns all bicycles with filtering and pagination for admin
  #
  # @api public
  # @example GET /api/v1/admin/bicycles?status=pending&page=1&limit=20
  # @param [String] status Filter by status (optional)
  # @param [Integer] page Page number for pagination (default: 1)
  # @param [Integer] limit Items per page (default: 20)
  # @return [JSON] Paginated list of bicycles in JSON:API format
  def index
    page = params.fetch(:page, 1).to_i
    limit = params.fetch(:limit, 20).to_i
    offset = (page - 1) * limit

    # 建立查詢，預載入關聯以避免 N+1 查詢
    query = Bicycle.includes(:user, :brand, photos_attachments: :blob)

    # 狀態過濾
    if params[:status].present?
      query = query.where(status: params[:status])
    end

    # 搜尋過濾
    if params[:search].present?
      search_term = "%#{params[:search]}%"
      query = query.where(
        "title ILIKE :search OR description ILIKE :search", 
        search: search_term
      )
    end

    # 計算總數和分頁
    total_count = query.count
    bicycles = query.order(created_at: :desc).offset(offset).limit(limit)

    # 使用統一的 JSON:API 集合回應格式
    meta = {
      total_count: total_count,
      current_page: page,
      per_page: limit,
      total_pages: (total_count.to_f / limit).ceil,
      status_counts: Bicycle.group(:status).count
    }

    render_jsonapi_collection(bicycles, serializer: BicycleSerializer, meta: meta)
  end

  # GET /api/v1/admin/bicycles/:id
  # Returns a specific bicycle for admin review
  #
  # @api public
  # @example GET /api/v1/admin/bicycles/1
  # @return [JSON] Bicycle details in JSON:API format
  def show
    render_jsonapi_resource(@bicycle, serializer: BicycleSerializer)
  end

  # PATCH /api/v1/admin/bicycles/:id/approve
  # Approves a pending bicycle
  #
  # @api public
  # @example PATCH /api/v1/admin/bicycles/1/approve
  # @return [JSON] Updated bicycle in JSON:API format
  def approve
    if @bicycle.update(status: :available)
      render_jsonapi_custom(
        type: 'bicycle_approval',
        id: @bicycle.id,
        attributes: {
          status: @bicycle.status,
          approved_at: Time.current.iso8601,
          approved_by: current_user.id
        },
        meta: {
          message: 'Bicycle approved successfully'
        }
      )
    else
      render_jsonapi_errors(@bicycle.errors.full_messages)
    end
  end

  # PATCH /api/v1/admin/bicycles/:id/reject
  # Rejects a pending bicycle
  #
  # @api public
  # @example PATCH /api/v1/admin/bicycles/1/reject
  # @param [String] reason Rejection reason (optional)
  # @return [JSON] Updated bicycle in JSON:API format
  def reject
    if @bicycle.update(status: :draft)
      render_jsonapi_custom(
        type: 'bicycle_rejection',
        id: @bicycle.id,
        attributes: {
          status: @bicycle.status,
          rejected_at: Time.current.iso8601,
          rejected_by: current_user.id,
          rejection_reason: params[:reason]
        },
        meta: {
          message: 'Bicycle rejected successfully'
        }
      )
    else
      render_jsonapi_errors(@bicycle.errors.full_messages)
    end
  end

  # PATCH /api/v1/admin/bicycles/:id
  # Updates bicycle details (admin only)
  #
  # @api public
  # @example PATCH /api/v1/admin/bicycles/1
  # @return [JSON] Updated bicycle in JSON:API format
  def update
    if @bicycle.update(bicycle_params)
      render_jsonapi_resource(@bicycle.reload, serializer: BicycleSerializer)
    else
      render_jsonapi_errors(@bicycle.errors.full_messages)
    end
  end

  # DELETE /api/v1/admin/bicycles/:id
  # Deletes a bicycle (admin only)
  #
  # @api public
  # @example DELETE /api/v1/admin/bicycles/1
  # @return [JSON] Empty response with 204 status
  def destroy
    if @bicycle.destroy
      head :no_content
    else
      render_jsonapi_errors(@bicycle.errors.full_messages)
    end
  end

  private

  # Sets the bicycle for actions that require it
  # @return [void]
  def set_bicycle
    @bicycle = Bicycle.includes(:user, :brand, photos_attachments: :blob)
                     .find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_jsonapi_errors(['Bicycle not found'], status: :not_found, title: 'Not Found')
  end

  # Ensures the current user is an admin
  # @raise [ActionController::RoutingError] if user is not an admin
  def ensure_admin!
    unless current_user&.admin?
      render_jsonapi_errors(['Access denied. Admin privileges required.'], status: :forbidden, title: 'Forbidden')
    end
  end

  # Strong parameters for bicycle updates
  # @return [ActionController::Parameters] Permitted parameters
  def bicycle_params
    params.require(:bicycle).permit(
      :title, :description, :price, :condition, :bicycle_type, 
      :frame_size, :location, :contact_method, :status,
      :brand_id, :transmission_id, :bicycle_model_id,
      :year, :model
    )
  end
end
