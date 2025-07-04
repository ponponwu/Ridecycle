# API controller for admin order management
# Provides operations for administrators to manage orders
#
# @author RideCycle Team
# @since 1.0.0
class Api::V1::Admin::OrdersController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_admin!
  before_action :set_order, only: [:show, :update, :approve_sale, :reject_sale]

  # GET /api/v1/admin/orders
  # Returns all orders with filtering and pagination for admin
  #
  # @api public
  # @example GET /api/v1/admin/orders?status=processing&page=1&limit=20
  # @param [String] status Filter by order status (optional)
  # @param [String] payment_status Filter by payment status (optional)
  # @param [Integer] page Page number for pagination (default: 1)
  # @param [Integer] limit Items per page (default: 20)
  # @return [JSON] Paginated list of orders in JSON:API format
  def index
    page = params.fetch(:page, 1).to_i
    limit = params.fetch(:limit, 20).to_i
    offset = (page - 1) * limit

    # Build query with includes for performance
    query = Order.includes(:user, :bicycle, :payment)

    # Status filtering
    if params[:status].present?
      query = query.where(status: params[:status])
    end

    # Payment status filtering
    if params[:payment_status].present?
      query = query.joins(:payment).where(order_payments: { status: params[:payment_status] })
    end

    # Search filtering
    if params[:search].present?
      search_term = "%#{params[:search]}%"
      query = query.joins(:user, :bicycle).where(
        "orders.order_number ILIKE :search OR users.email ILIKE :search OR bicycles.title ILIKE :search", 
        search: search_term
      )
    end

    # Calculate total count and paginate
    total_count = query.count
    orders = query.order(created_at: :desc).offset(offset).limit(limit)

    # Use unified JSON:API collection response format
    meta = {
      total_count: total_count,
      current_page: page,
      per_page: limit,
      total_pages: (total_count.to_f / limit).ceil,
      status_counts: Order.group(:status).count,
      payment_status_counts: OrderPayment.group(:status).count
    }

    render_jsonapi_collection(orders, serializer: OrderSerializer, meta: meta)
  end

  # GET /api/v1/admin/orders/:id
  # Returns a specific order for admin review
  #
  # @api public
  # @example GET /api/v1/admin/orders/1
  # @return [JSON] Order details in JSON:API format
  def show
    render_jsonapi_resource(@order, serializer: OrderSerializer)
  end

  # PATCH /api/v1/admin/orders/:id/approve_sale
  # Approves a paid order and marks bicycle as sold
  #
  # @api public
  # @example PATCH /api/v1/admin/orders/1/approve_sale
  # @return [JSON] Updated order in JSON:API format
  def approve_sale
    unless @order.can_be_approved_by_admin?
      render_jsonapi_errors(['Order cannot be approved. Payment must be confirmed and bicycle must be reserved.'], status: :unprocessable_entity)
      return
    end

    if @order.admin_approve_sale!
      render_jsonapi_custom(
        type: 'order_approval',
        id: @order.id,
        attributes: {
          order_number: @order.order_number,
          status: @order.status,
          bicycle_status: @order.bicycle.status,
          approved_at: Time.current.iso8601,
          approved_by: current_user.id
        },
        meta: {
          message: 'Order approved successfully. Bicycle marked as sold.'
        }
      )
    else
      render_jsonapi_errors(['Failed to approve order'], status: :unprocessable_entity)
    end
  end

  # PATCH /api/v1/admin/orders/:id/reject_sale
  # Rejects a paid order and restores bicycle to available
  #
  # @api public
  # @example PATCH /api/v1/admin/orders/1/reject_sale
  # @param [String] reason Rejection reason (optional)
  # @return [JSON] Updated order in JSON:API format
  def reject_sale
    unless @order.payment&.status_paid?
      render_jsonapi_errors(['Order cannot be rejected. Payment must be confirmed first.'], status: :unprocessable_entity)
      return
    end

    Order.transaction do
      # Update order status to cancelled
      @order.update!(status: :cancelled)
      
      # Restore bicycle to available status
      @order.bicycle.update!(status: :available) if @order.bicycle&.status_reserved?
      
      # Mark payment as refunded if needed
      @order.payment.update!(status: :refunded) if @order.payment.status_paid?

      render_jsonapi_custom(
        type: 'order_rejection',
        id: @order.id,
        attributes: {
          order_number: @order.order_number,
          status: @order.status,
          bicycle_status: @order.bicycle.status,
          payment_status: @order.payment.status,
          rejected_at: Time.current.iso8601,
          rejected_by: current_user.id,
          rejection_reason: params[:reason]
        },
        meta: {
          message: 'Order rejected successfully. Bicycle restored to available.'
        }
      )
    end
  rescue StandardError => e
    Rails.logger.error "Failed to reject order #{@order.order_number}: #{e.message}"
    render_jsonapi_errors(['Failed to reject order'], status: :unprocessable_entity)
  end

  # PATCH /api/v1/admin/orders/:id
  # Updates order details (admin only)
  #
  # @api public
  # @example PATCH /api/v1/admin/orders/1
  # @return [JSON] Updated order in JSON:API format
  def update
    if @order.update(order_params)
      render_jsonapi_resource(@order.reload, serializer: OrderSerializer)
    else
      render_jsonapi_errors(@order.errors.full_messages)
    end
  end

  private

  # Sets the order for actions that require it
  # @return [void]
  def set_order
    @order = Order.includes(:user, :bicycle, :payment)
                  .find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_jsonapi_errors(['Order not found'], status: :not_found, title: 'Not Found')
  end

  # Ensures the current user is an admin
  # @raise [ActionController::RoutingError] if user is not an admin
  def ensure_admin!
    unless current_user&.admin?
      render_jsonapi_errors(['Access denied. Admin privileges required.'], status: :forbidden, title: 'Forbidden')
    end
  end

  # Strong parameters for order updates
  # @return [ActionController::Parameters] Permitted parameters
  def order_params
    params.require(:order).permit(
      :status, :shipping_method, :shipping_distance, 
      shipping_address: [:full_name, :phone_number, :county, :district, :address_line1, :address_line2, :postal_code, :delivery_notes]
    )
  end
end