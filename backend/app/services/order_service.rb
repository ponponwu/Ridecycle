# frozen_string_literal: true

# Service class for handling order operations
# Provides business logic for order creation, updates, and validations
#
# @author RideCycle Team
# @since 1.0.0
class OrderService
  include ServiceResult

  # Creates a new order for a user
  #
  # @param user [User] The user creating the order
  # @param order_params [Hash] Order parameters
  # @return [ServiceResult] Success with order data or failure with errors
  def self.create_order(user, order_params)
    new.create_order(user, order_params)
  end

  # Updates an existing order
  #
  # @param order [Order] The order to update
  # @param update_params [Hash] Update parameters
  # @return [ServiceResult] Success with updated order or failure with errors
  def self.update_order(order, update_params)
    new.update_order(order, update_params)
  end

def create_order(user, order_params)
   return failure(['User is required'], :bad_request) unless user


   Order.transaction do
    bicycle = Bicycle.lock.find_by(id: order_params[:bicycle_id])
    return failure(['Bicycle not found'], :not_found) unless bicycle
    return failure(['Bicycle is not available for purchase'], :unprocessable_entity) unless bicycle_available?(bicycle)
    
     order = build_order(user, bicycle, order_params)
      
      if order.save
        # Mark bicycle as sold if payment is successful
        if order.payment_method_bank_transfer?
          # For bank transfer, keep bicycle available until payment is confirmed
          # We'll update this in a separate payment confirmation process
        end
        
        success(order)
      else
        failure(order.errors.full_messages, :unprocessable_entity)
      end
    end
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error("OrderService#create_order RecordInvalid: #{e.message}")
    failure([e.message], :unprocessable_entity)
  rescue StandardError => e
    Rails.logger.error("OrderService#create_order failed: #{e.message}")
    Rails.logger.error("Backtrace: #{e.backtrace[0..10]}")
    failure(["Order creation failed: #{e.message}"], :internal_server_error)
  end

  def update_order(order, update_params)
    return failure(['Order is required'], :bad_request) unless order

    if order.update(update_params)
      success(order)
    else
      failure(order.errors.full_messages, :unprocessable_entity)
    end
  rescue StandardError => e
    Rails.logger.error("OrderService#update_order failed: #{e.message}")
    failure(['Order update failed'], :internal_server_error)
  end

  private

  def find_bicycle(bicycle_id)
    return nil unless bicycle_id
    Bicycle.find_by(id: bicycle_id)
  end

  def bicycle_available?(bicycle)
    bicycle.status == 'available'
  end

  def build_order(user, bicycle, order_params)
    order = Order.new(
      user: user,
      bicycle: bicycle,
      order_number: generate_order_number,
      total_price: order_params[:total_price] || calculate_total_price(bicycle, order_params),
      status: :pending,
      payment_status: :pending,
      payment_method: order_params[:payment_method] || :bank_transfer,
      shipping_method: determine_shipping_method(order_params),
      shipping_distance: order_params[:shipping_distance],
      shipping_address: sanitize_shipping_address(order_params[:shipping_address]),
      payment_details: sanitize_payment_details(order_params[:payment_details])
    )

    # Set shipping cost and payment instructions
    order.shipping_cost = calculate_shipping_cost(order)
    order.payment_instructions = generate_payment_instructions(order)

    order
  end

  def generate_order_number
    "ORD-#{Time.current.strftime('%Y%m%d')}-#{SecureRandom.hex(4).upcase}"
  end

def calculate_total_price(bicycle, order_params)
  subtotal = bicycle.price
  shipping_cost = calculate_shipping_cost_from_params(order_params)
  tax_rate = Rails.application.config.tax_rate || 0.05
  tax = (subtotal * tax_rate).round
   
   subtotal + shipping_cost + tax
 end

  def calculate_shipping_cost_from_params(order_params)
    delivery_option = order_params[:delivery_option] || {}
    delivery_option[:cost] || 100
  end
SHIPPING_CONFIG = {
  base_cost: 100,
  remote_region_surcharge: 50,
  weight_threshold: 10,
  weight_surcharge_per_kg: 20,
  remote_regions: %w[penghu kinmen lienchiang taitung hualien].freeze
}.freeze

 def calculate_shipping_cost(order)
   return 0 if order.shipping_method_self_pickup?
   
  base_cost = SHIPPING_CONFIG[:base_cost]
   
   county = order.shipping_address&.dig('county')
  base_cost += SHIPPING_CONFIG[:remote_region_surcharge] if SHIPPING_CONFIG[:remote_regions].include?(county)
   
  # Note: weight attribute doesn't exist on Bicycle model yet
  # if order.bicycle.weight && order.bicycle.weight > SHIPPING_CONFIG[:weight_threshold]
  #   extra_weight = (order.bicycle.weight - SHIPPING_CONFIG[:weight_threshold]).ceil
  #   base_cost += extra_weight * SHIPPING_CONFIG[:weight_surcharge_per_kg]
  # end
   
   base_cost
 end

  def determine_shipping_method(order_params)
    delivery_option = order_params[:delivery_option] || {}
    case delivery_option[:type]
    when 'pickup'
      :self_pickup
    when 'delivery'
      :assisted_delivery
    else
      :assisted_delivery # default
    end
  end

  def sanitize_shipping_address(shipping_address)
    return {} unless shipping_address.is_a?(Hash)
    
    shipping_address.slice(
      'full_name', 'phone_number', 'county', 'district',
      'address_line1', 'address_line2', 'postal_code', 'delivery_notes'
    ).compact
  end

  def sanitize_payment_details(payment_details)
    return {} unless payment_details.is_a?(Hash)
    
    payment_details.slice(
      'transfer_note', 'account_last_five_digits', 'transfer_proof_url'
    ).compact
  end

  def sanitize_delivery_option(delivery_option)
    return {} unless delivery_option.is_a?(Hash)
    
    delivery_option.slice(
      'type', 'cost', 'estimated_days_min', 'estimated_days_max', 'note'
    ).compact
  end

  def generate_payment_instructions(order)
    if order.payment_method_bank_transfer?
      {
        bank_name: '玉山銀行',
        bank_code: '808',
        account_number: '1234567890123',
        account_name: 'RideCycle 二手自行車交易平台有限公司',
        branch: '台北分行',
        amount: order.total_price,
        deadline: order.payment_deadline || 3.days.from_now,
        note: '請於3天內完成轉帳，並保留收據作為付款證明。逾期訂單將自動取消。'
      }
    else
      {}
    end
  end
end 