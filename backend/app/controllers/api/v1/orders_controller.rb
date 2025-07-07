# frozen_string_literal: true

# API controller for order management  
# Handles order operations in the marketplace
#
# @author RideCycle Team
# @since 1.0.0
class Api::V1::OrdersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_order, only: [:show, :update, :complete, :cancel, :payment_proof, :payment_proof_file]

  # Gets current user's orders with pagination
  # 
  # @api public
  # @example GET /api/v1/orders?type=purchases (default)
  # @example GET /api/v1/orders?type=sales  
  # @param [Integer] page Page number (default: 1)
  # @param [Integer] per_page Items per page (default: 10)
  # @param [String] type Order type: 'purchases' (as buyer) or 'sales' (as seller)
  # @param [String] status Filter by status (optional)
  # @return [JSON] Orders collection with pagination meta in JSON:API format
  def index
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 10
    offset = (page - 1) * per_page
    order_type = params[:type] || 'purchases'
    status_filter = params[:status]

    # 根據類型選擇訂單
    if order_type == 'sales'
      # 作為賣家的訂單（銷售）
      orders_relation = Order.joins(:bicycle)
                            .where(bicycles: { user_id: current_user.id })
                            .includes(
                              :user, # 買家資訊
                              :payment, # OrderPayment
                              payment: [:payment_proofs_attachments, :payment_proofs_blobs], # ActiveStorage 付款證明
                              bicycle: [
                                :user,                 # 賣家資訊
                                :brand,                # 自行車品牌
                                :bicycle_model,        # 自行車型號
                                :photos_attachments,   # ActiveStorage 照片
                                :photos_blobs
                              ]
                            )
    else
      # 作為買家的訂單（購買）
      orders_relation = current_user.orders.includes(
                          :payment, # OrderPayment
                          payment: [:payment_proofs_attachments, :payment_proofs_blobs], # ActiveStorage 付款證明
                          bicycle: [
                            :user,                 # 賣家資訊
                            :brand,                # 自行車品牌
                            :bicycle_model,        # 自行車型號
                            :photos_attachments,   # ActiveStorage 照片
                            :photos_blobs
                          ]
                        )
    end

    # 狀態篩選
    orders_relation = orders_relation.where(status: status_filter) if status_filter.present?
    
    orders_relation = orders_relation.order(created_at: :desc)
    total_count = orders_relation.count
    orders = orders_relation.offset(offset).limit(per_page)

    pagination_meta = {
      current_page: page,
      total_pages: (total_count.to_f / per_page).ceil,
      total_count: total_count,
      per_page: per_page,
      order_type: order_type
    }

    render_jsonapi_collection(orders, 
                             serializer: OrderSerializer, 
                             meta: pagination_meta)
  end

  # Gets a specific order by ID
  # 
  # @api public
  # @example GET /api/v1/orders/:id
  # @param [String] id Order ID
  # @return [JSON] Order details in JSON:API format
  # @return [JSON] Error if order not found or unauthorized
  def show
    render_jsonapi_resource(@order, serializer: OrderSerializer)
  end

  # Creates a new order
  # 
  # @api public
  # @example POST /api/v1/orders
  # @param [Object] order Order data including bicycle_id, shipping_info, payment_info, delivery_option
  # @return [JSON] Created order in JSON:API format
  # @return [JSON] Error messages if creation fails
  def create
    result = OrderService.create_order(current_user, order_params)
    
    if result.success?
      render_jsonapi_resource(result.data, serializer: OrderSerializer, status: :created)
    else
      render_jsonapi_errors(result.errors, status: result.status)
    end
  end

  # Updates an existing order
  # 
  # @api public
  # @example PATCH /api/v1/orders/:id
  # @param [String] id Order ID
  # @param [Object] order Updated order data
  # @return [JSON] Updated order in JSON:API format
  # @return [JSON] Error messages if update fails
  def update
    result = OrderService.update_order(@order, update_params)
    
    if result.success?
      render_jsonapi_resource(result.data, serializer: OrderSerializer)
    else
      render_jsonapi_errors(result.errors, status: result.status)
    end
  end

  # Marks order as complete
  # 
  # @api public
  # @example PUT /api/v1/orders/:id/complete
  # @param [String] id Order ID
  # @return [JSON] Updated order in JSON:API format
  def complete
    @order.update!(status: :completed)
    render_jsonapi_resource(@order, serializer: OrderSerializer)
  end

  # Cancels an order
  # 
  # @api public
  # @example PUT /api/v1/orders/:id/cancel
  # @param [String] id Order ID
  # @param [String] reason Cancellation reason
  # @return [JSON] Updated order in JSON:API format
  def cancel
    @order.update!(status: :cancelled, cancel_reason: params[:reason])
    render_jsonapi_resource(@order, serializer: OrderSerializer)
  end

  # Uploads payment proof for an order
  #
  # @api public
  # @example POST /api/v1/orders/:id/payment_proof
  # @param [String] id Order ID
  # @param [File] payment_proof Payment proof file
  # @return [JSON] Success response or error messages
  def payment_proof
    # 檢查訂單是否屬於當前用戶（買家）
    unless @order.user == current_user
      return render_jsonapi_errors(['Unauthorized to upload payment proof for this order'], status: :forbidden)
    end

    # 檢查訂單狀態是否允許上傳付款證明
    unless @order.status_pending? && @order.payment&.status_pending?
      return render_jsonapi_errors(['Cannot upload payment proof for this order status'], status: :unprocessable_entity)
    end

    uploaded_file = params[:payment_proof]
    
    unless uploaded_file.present?
      return render_jsonapi_errors(['Payment proof file is required'], status: :bad_request)
    end

    # 驗證檔案類型
    unless uploaded_file.content_type.in?(['image/jpeg', 'image/png', 'image/gif', 'application/pdf'])
      return render_jsonapi_errors(['Invalid file format. Only JPEG, PNG, GIF, and PDF are allowed'], status: :unprocessable_entity)
    end

    # 驗證檔案大小 (5MB)
    if uploaded_file.size > 5.megabytes
      return render_jsonapi_errors(['File size too large. Maximum size is 5MB'], status: :unprocessable_entity)
    end

    begin
      # 使用 ActiveStorage 附加檔案到 OrderPayment
      payment = @order.payment
      return render_jsonapi_errors(['No payment record found'], status: :not_found) unless payment

      attachment = payment.payment_proofs.attach(
        io: uploaded_file.tempfile,
        filename: uploaded_file.original_filename,
        content_type: uploaded_file.content_type,
        metadata: {
          status: 'pending',
          uploaded_by_id: current_user.id,
          uploaded_at: Time.current.iso8601,
          original_filename: uploaded_file.original_filename
        }
      )

        if attachment
         # 更新付款狀態為待確認
         payment.update!(status: :awaiting_confirmation)
         
         render json: {
           success: true,
           message: '付款證明已成功上傳，我們將在24小時內確認您的付款'
         }, status: :ok
       else
         render_jsonapi_errors(['Failed to upload payment proof'], status: :internal_server_error)
       end

    rescue StandardError => e
      Rails.logger.error("Failed to upload payment proof: #{e.message}")
      render_jsonapi_errors(['Failed to upload payment proof'], status: :internal_server_error)
    end
  end

  # Gets payment proof file for an order
  #
  # @api public
  # @example GET /api/v1/orders/:id/payment_proof_file
  # @param [String] id Order ID
  # @return [File] Payment proof file or error
  def payment_proof_file
    # 檢查權限：只有管理員、買家或賣家可以查看付款證明
    seller = @order.bicycle.user
    unless current_user.admin? || @order.user == current_user || seller == current_user
      return render_jsonapi_errors(['Unauthorized to view payment proof'], status: :forbidden)
    end

    # 檢查是否有上傳的付款證明
    payment = @order.payment
    unless payment&.has_payment_proof?
      return render_jsonapi_errors(['No payment proof found'], status: :not_found)
    end

    latest_proof = payment.latest_payment_proof

    # 回傳檔案
    send_data latest_proof.download,
              filename: latest_proof.filename.to_s,
              type: latest_proof.content_type,
              disposition: 'inline' # 在瀏覽器中顯示而不是下載
  end

  private

  def set_order
    # Find by order_number first, then fall back to ID for backward compatibility
    identifier = params[:id]
    query_field = :id
    
    # Check for order number formats:
    # New format: R-YYMMDD-XXXXXX (e.g., R-250627-A1B2C3)
    # Legacy format: ORD-YYYYMMDD-XXXXXXXX (e.g., ORD-20250609-ACF5F4E5)
    if identifier.to_s.match?(/^(R-\d{6}-|ORD-\d{8}-)/)
      query_field = :order_number
    elsif identifier.to_s.match?(/^\d+$/) # Check if it's a numeric ID
      query_field = :id
    else
      # If it's neither a valid order number format nor a numeric ID, it's not found
      render_jsonapi_errors(['Order not found'], status: :not_found)
      return
    end

    @order = Order.joins(:bicycle)
                  .where(
                    '(orders.user_id = :user_id OR bicycles.user_id = :user_id) AND orders.%s = :identifier' % query_field,
                    { user_id: current_user.id, identifier: identifier }
                  )
                  .includes(
                    :user, # Buyer info
                    :payment, # OrderPayment
                    payment: [:payment_proofs_attachments, :payment_proofs_blobs], # ActiveStorage 付款證明
                    bicycle: [
                      :user, # Seller info
                      :brand,
                      :bicycle_model,
                      :photos_attachments,
                      :photos_blobs
                    ]
                  )
                  .first

    unless @order
      render_jsonapi_errors(['Order not found'], status: :not_found)
    end
  end

  def order_params
    params.require(:order).permit(
      :bicycle_id,
      :total_price,
      :payment_method,
      :shipping_method,
      :shipping_distance,
      shipping_address: [
        :full_name, :phone_number, :county, :district, 
        :address_line1, :address_line2, :postal_code, :delivery_notes
      ],
      payment_details: [
        :transfer_note, :account_last_five_digits, :transfer_proof_url
      ],
      delivery_option: [
        :type, :cost, :estimated_days_min, :estimated_days_max, :note
      ]
    )
  end

  def update_params
    params.require(:order).permit(:status, :tracking_number, :carrier)
  end
end 