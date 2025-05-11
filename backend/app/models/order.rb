class Order < ApplicationRecord
  belongs_to :user # The buyer
  belongs_to :bicycle

  # Enum for status, matching frontend's OrderStatus if possible, or use strings
  # Example if using string status directly from frontend:
  # validates :status, presence: true, inclusion: { 
  #   in: %w[pending processing shipped delivered completed cancelled refunded], 
  #   message: "%{value} is not a valid status" 
  # }

  # If you prefer Rails enums:
  enum status: {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    completed: 4,
    cancelled: 5,
    refunded: 6
  }, _prefix: :status

  enum payment_status: {
    pending: 0,
    paid: 1,
    failed: 2,
    refunded: 3 # Note: 'refunded' is also an order status, ensure consistency
  }, _prefix: :payment_status


  validates :order_number, presence: true, uniqueness: true
  validates :total_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :user_id, presence: true
  validates :bicycle_id, presence: true

  # Store complex objects as JSON(B)
  # serialize :shipping_address, JSON # For older Rails or if not using jsonb column type by default
  # serialize :payment_details, JSON

  # Ensure order_number is generated before validation if not provided
  before_validation :generate_order_number, on: :create

  private

  def generate_order_number
    self.order_number ||= loop do
      # Generates a unique order number, e.g., ORD-YYYYMMDD-XXXXXX
      timestamp_part = Time.current.strftime('%Y%m%d')
      random_part = SecureRandom.hex(3).upcase
      candidate = "ORD-#{timestamp_part}-#{random_part}"
      break candidate unless Order.exists?(order_number: candidate)
    end
  end
end