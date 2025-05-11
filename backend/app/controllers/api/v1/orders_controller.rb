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

        all_orders = @current_user.orders.includes(bicycle: [:user, { photos_attachments: :blob }]).order(created_at: :desc)
        @orders = all_orders.offset(offset).limit(limit)
        total_count = all_orders.count

        orders_with_details = @orders.map do |order|
          order_data = order.as_json(include: { 
            bicycle: { 
              include: { 
                user: { only: [:id, :name] }, # Seller info
              },
              methods: [] # Add :photos_urls if you define it in Bicycle model
            }
          })
          # Manually add bicycle photo URL if not handled by methods in model's as_json
          if order.bicycle && order.bicycle.photos.attached?
            order_data['bicycle']['photos_urls'] = order.bicycle.photos.map { |photo| url_for(photo) }
          else
            order_data['bicycle']['photos_urls'] = [] if order.bicycle
          end
          order_data
        end

        render json: {
          orders: orders_with_details,
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
      #     render json: @order, status: :created
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