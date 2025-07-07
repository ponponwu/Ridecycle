class Order < ApplicationRecord
  belongs_to :user # The buyer
  belongs_to :bicycle

  # OrderPayment association - one payment per order
  has_one :payment, class_name: 'OrderPayment', dependent: :destroy

  # Delegate payment-related methods to OrderPayment
  delegate :payment_status, :payment_method, :payment_deadline, :payment_instructions,
           :company_account_info, :remaining_payment_hours, :remaining_payment_time_humanized,
           :has_payment_proof?, :latest_payment_proof, :payment_proof_status,
           :set_payment_proof_status, :payment_proof_approved?, :payment_proof_rejected?,
           :payment_proof_pending?, to: :payment, allow_nil: true

  # Enum for status, matching frontend's OrderStatus if possible, or use strings
  # Example if using string status directly from frontend:
  # validates :status, presence: true, inclusion: { 
  #   in: %w[pending processing shipped delivered completed cancelled refunded], 
  #   message: "%{value} is not a valid status" 
  # }

  # If you prefer Rails enums:
  enum :status, {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    completed: 4,
    cancelled: 5,
    refunded: 6
  }, prefix: true

  # 配送方式 enum
  enum :shipping_method, {
    self_pickup: 0,      # 自行運送
    assisted_delivery: 1  # 我們協助運送
  }, prefix: true

  validates :order_number, presence: true, uniqueness: true
  validates :total_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :user_id, presence: true
  validates :bicycle_id, presence: true
  validates :shipping_method, presence: true
  validate :bicycle_must_be_available, on: :create

  # 配送距離驗證 - 當選擇協助運送時必須有距離資訊
  validates :shipping_distance, presence: true, numericality: { greater_than: 0 }, 
            if: :shipping_method_assisted_delivery?

  # Store complex objects as JSON(B)
  # serialize :shipping_address, JSON # For older Rails or if not using jsonb column type by default
  # serialize :payment_details, JSON

  # Ensure order_number is generated before validation if not provided
  before_validation :generate_order_number, on: :create
  before_validation :calculate_shipping_cost, on: :create
  after_create :create_order_payment
  after_create :reserve_bicycle
  after_create :set_processing_status
  after_update :update_bicycle_status_on_payment_change
  after_update :restore_bicycle_on_cancellation
  
  # Scopes for order management
  scope :pending_payment, -> { joins(:payment).where(status: :pending, order_payments: { status: 0 }) }
  scope :expired, -> { joins(:payment).where('order_payments.expires_at < ?', Time.current) }
  scope :pending_and_expired, -> { pending_payment.expired }

  # 計算運費的方法
  def calculate_shipping_cost_amount
    if shipping_method_self_pickup?
      0
    elsif shipping_method_assisted_delivery?
      calculate_delivery_cost
    else
      0
    end
  end

  # 根據距離計算配送費用
  def calculate_delivery_cost
    return 0 unless shipping_distance.present?
    
    base_cost = 100 # 基本運費 NT$100
    distance_cost = shipping_distance * 10 # 每公里 NT$10
    
    base_cost + distance_cost
  end

  # 檢查是否可以完成訂單
  def can_complete?
    payment&.status_paid? && (status_delivered? || status_shipped?)
  end
  
  # 管理員批准訂單並標記腳踏車為已售出
  def admin_approve_sale!
    return false unless payment&.status_paid?
    return false unless bicycle&.reserved?
    
    Order.transaction do
      bicycle.update!(status: :sold)
      update!(status: :completed)
      Rails.logger.info "Admin approved sale for order #{order_number}, bicycle #{bicycle.id} marked as sold"
      true
    end
  rescue StandardError => e
    Rails.logger.error "Failed to approve sale for order #{order_number}: #{e.message}"
    false
  end
  
  # 檢查訂單是否可以被管理員批准
  def can_be_approved_by_admin?
    payment&.status_paid? && bicycle&.reserved? && status_processing?
  end

  # 取得賣家資訊
  def seller
    bicycle.user
  end

  # 取得買家資訊
  def buyer
    user
  end

  # 檢查賣家是否有完整的銀行戶頭資訊
  def seller_bank_account_complete?
    seller.bank_account_complete?
  end

  # 檢查訂單是否已過期（delegate to payment）
  def expired?
    payment&.expired? || false
  end

  # 自動取消過期訂單 - 配合 OrderPayment 架構
  def self.cancel_expired_orders!
    expired_orders = pending_and_expired
    cancelled_count = 0
    
    expired_orders.find_each do |order|
      Order.transaction do
        # 先處理 OrderPayment 狀態
        if order.payment&.mark_as_failed!('Payment deadline expired')
          # 然後更新訂單狀態
          if order.update!(status: :cancelled)
            cancelled_count += 1
            Rails.logger.info "訂單 #{order.order_number} 因付款超期而自動取消"
          end
        end
      end
    rescue StandardError => e
      Rails.logger.error "取消過期訂單 #{order&.order_number} 時發生錯誤: #{e.message}"
    end
    
    Rails.logger.info "自動取消了 #{cancelled_count} 個過期訂單"
    cancelled_count
  end

  private

  def generate_order_number
    return if order_number.present?
    
    self.order_number = loop do
      # Generates a unique order number, e.g., R-YYMMDD-XXXXXX
      timestamp_part = Time.current.strftime('%y%m%d')
      random_part = SecureRandom.alphanumeric(6).upcase
      candidate = "R-#{timestamp_part}-#{random_part}"
      break candidate unless Order.exists?(order_number: candidate)
    end
  end

  def calculate_shipping_cost
    self.shipping_cost = calculate_shipping_cost_amount
  end

  def create_order_payment
    # Create the associated OrderPayment record
    payment_deadline = 3.days.from_now
    payment_method = @payment_method_for_creation || :bank_transfer # Default to bank_transfer
    
    payment = OrderPayment.create!(
      order: self,
      status: :pending,
      method: payment_method,
      amount: total_price,
      deadline: payment_deadline,
      expires_at: payment_deadline
    )
    
    Rails.logger.info "Created OrderPayment #{payment.id} for Order #{order_number} with method #{payment_method}"
  rescue StandardError => e
    Rails.logger.error "Failed to create OrderPayment for Order #{order_number}: #{e.message}"
    raise e
  end

  # Set payment method for creation (called by OrderService)
  def set_payment_method_for_creation(method)
    @payment_method_for_creation = method
  end

  # Bicycle status management callbacks
  def reserve_bicycle
    return unless bicycle&.available?
    
    bicycle.update!(status: :reserved)
    Rails.logger.info "Reserved bicycle #{bicycle.id} for order #{order_number}"
  rescue StandardError => e
    Rails.logger.error "Failed to reserve bicycle #{bicycle&.id} for order #{order_number}: #{e.message}"
  end

  def update_bicycle_status_on_payment_change
    return unless bicycle && payment
    
    # Payment confirmation no longer automatically marks bicycle as sold
    # Admin approval is required after payment to mark bicycle as sold
    if payment.status_paid? && bicycle.reserved?
      Rails.logger.info "Payment confirmed for order #{order_number}, bicycle #{bicycle.id} remains reserved pending admin approval"
    end
  rescue StandardError => e
    Rails.logger.error "Failed to update bicycle status for order #{order_number}: #{e.message}"
  end

  def restore_bicycle_on_cancellation
    return unless bicycle
    
    # When order is cancelled, restore bicycle to available
    if status_cancelled? && (bicycle.reserved? || bicycle.sold?)
      bicycle.update!(status: :available)
      Rails.logger.info "Restored bicycle #{bicycle.id} to available status for cancelled order #{order_number}"
    end
  rescue StandardError => e
    Rails.logger.error "Failed to restore bicycle status for order #{order_number}: #{e.message}"
  end
  
  # Set order status to processing after creation (payment pending)
  def set_processing_status
    update_column(:status, :processing) if status_pending?
  rescue StandardError => e
    Rails.logger.error "Failed to set processing status for order #{order_number}: #{e.message}"
  end
  
  # Validation to ensure bicycle is available for order creation
  def bicycle_must_be_available
    return unless bicycle
    
    unless bicycle.available?
      errors.add(:bicycle, "must be available for purchase. Current status: #{bicycle.status}")
    end
  end
end