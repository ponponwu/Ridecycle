module Api
  module V1
    class OrdersController < ApplicationController
      # before_action :set_order, only: [:show] # Add if a show action for a single order is needed

      # GET /api/v1/orders/me
      # Fetches orders for the current logged-in user
      def me
        # Basic pagination
        page = params.fetch(:page, 1).to_i
        limit = params.fetch(:limit, 10).to_i
        offset = (page - 1) * limit

        all_orders = @current_user.orders.includes(:bicycle, bicycle: [:user, { photos_attachments: :blob }]).order(created_at: :desc)
        @orders = all_orders.offset(offset).limit(limit)
        total_count = all_orders.count

        # 使用 OrderSerializer 進行序列化
        options = {}
        options[:include] = [:user, :bicycle] # 包含關聯的用戶和自行車
        
        # 序列化訂單
        serialized_orders = OrderSerializer.new(@orders, options).serializable_hash

        # 為了保持與前端的兼容，可以轉換回舊的 JSON 結構
        # 或者讓前端適應 JSON:API 格式
        render json: {
          orders: serialized_orders[:data].map { |item| 
            order_attributes = item[:attributes]
            bicycle = item[:relationships][:bicycle][:data]
            # 找到 bicycle 的資料
            bicycle_data = serialized_orders[:included]&.find { |inc| inc[:type] == 'bicycle' && inc[:id] == bicycle[:id] }
            
            # 合併資料
            order_attributes.merge(
              id: item[:id],
              bicycle: bicycle_data ? bicycle_data[:attributes].merge(id: bicycle_data[:id]) : nil
            )
          },
          totalCount: total_count,
          page: page,
          limit: limit,
          totalPages: (total_count.to_f / limit).ceil
        }
      end

      # Add other order actions like create, show if needed.
      # Example: POST /api/v1/orders (to create an order)
      # def create
      #   @order = @current_user.orders.build(order_params)
      #   if @order.save
      #     # Potentially update bicycle status, send notifications, etc.
      #     render json: OrderSerializer.new(@order).serializable_hash, status: :created
      #   else
      #     render json: @order.errors, status: :unprocessable_entity
      #   end
      # end

      private

      # def set_order
      #   @order = @current_user.orders.find(params[:id])
      # rescue ActiveRecord::RecordNotFound
      #   render json: { error: 'Order not found' }, status: :not_found
      # end

      # def order_params
      #   params.require(:order).permit(:bicycle_id, :total_price, :status /* other params */)
      # end
    end
  end
end