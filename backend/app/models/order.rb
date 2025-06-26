class Order < ApplicationRecord
  belongs_to :user # The buyer
  belongs_to :bicycle

  # 付款證明檔案關聯
  has_many_attached :payment_proofs

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

  enum :payment_status, {
    pending: 0,
    awaiting_confirmation: 1, # 待確認 (已上傳付款證明)
    paid: 2,
    failed: 3,
    refunded: 4 # Note: 'refunded' is also an order status, ensure consistency
  }, prefix: true

  # 配送方式 enum
  enum :shipping_method, {
    self_pickup: 0,      # 自行運送
    assisted_delivery: 1  # 我們協助運送
  }, prefix: true

  # 付款方式 enum
  enum :payment_method, {
    bank_transfer: 0 # 銀行匯款
  }, prefix: true

  validates :order_number, presence: true, uniqueness: true
  validates :total_price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :user_id, presence: true
  validates :bicycle_id, presence: true
  validates :shipping_method, presence: true
  validates :payment_method, presence: true

  # 配送距離驗證 - 當選擇協助運送時必須有距離資訊
  validates :shipping_distance, presence: true, numericality: { greater_than: 0 }, 
            if: :shipping_method_assisted_delivery?

  # Store complex objects as JSON(B)
  # serialize :shipping_address, JSON # For older Rails or if not using jsonb column type by default
  # serialize :payment_details, JSON

  # Ensure order_number is generated before validation if not provided
  before_validation :generate_order_number, on: :create
  before_validation :calculate_shipping_cost, on: :create
  before_validation :set_payment_deadline, on: :create
  before_save :set_payment_instructions
  
  # Scopes for order management
  scope :pending_payment, -> { where(status: :pending, payment_status: :pending) }
  scope :expired, -> { where('expires_at < ?', Time.current) }
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

  # 設定付款說明
  def set_payment_instructions_text
    if payment_method_bank_transfer?
      I18n.t('payment.instructions') + "\n\n" + 
      I18n.t('payment.company_account_info').gsub('訂單編號', order_number || 'PENDING')
    else
      ''
    end
  end

  # 檢查是否可以完成訂單
  def can_complete?
    payment_status_paid? && (status_delivered? || status_shipped?)
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

  # 檢查訂單是否已過期
  def expired?
    expires_at.present? && expires_at < Time.current
  end

  # 取得剩餘付款時間（以小時為單位）
  def remaining_payment_hours
    return 0 if payment_deadline.blank? || payment_deadline < Time.current
    
    ((payment_deadline - Time.current) / 1.hour).ceil
  end

  # 取得剩餘付款時間的人性化顯示
  def remaining_payment_time_humanized
    return I18n.t('orders.payment_expired') if expired?
    
    hours = remaining_payment_hours
    if hours > 24
      days = (hours / 24.0).ceil
      I18n.t('orders.remaining_days', count: days)
    else
      I18n.t('orders.remaining_hours', count: hours)
    end
  end

  # 自動取消過期訂單
  def self.cancel_expired_orders!
    expired_orders = pending_and_expired
    cancelled_count = 0
    
    expired_orders.find_each do |order|
      if order.update(status: :cancelled)
        cancelled_count += 1
        Rails.logger.info "訂單 #{order.order_number} 因付款超期而自動取消"
      end
    end
    
    Rails.logger.info "自動取消了 #{cancelled_count} 個過期訂單"
    cancelled_count
  end

  # 付款證明相關方法
  
  # 檢查是否有有效的付款證明
  def has_payment_proof?
    payment_proofs.attached? && payment_proofs.any?
  end

  # 取得最新的付款證明
  def latest_payment_proof
    return nil unless has_payment_proof?
    payment_proofs.order(created_at: :desc).first
  end

  # 取得付款證明狀態
  def payment_proof_status
    proof = latest_payment_proof
    return 'none' unless proof
    
    metadata = proof.metadata || {}
    metadata['status'] || 'pending'
  end

  # 設定付款證明狀態
  def set_payment_proof_status(status, reviewed_by_user = nil, notes = nil)
    proof = latest_payment_proof
    return false unless proof

    metadata = proof.metadata || {}
    metadata['status'] = status
    metadata['reviewed_at'] = Time.current.iso8601
    metadata['reviewed_by_id'] = reviewed_by_user&.id
    metadata['review_notes'] = notes if notes

    proof.metadata = metadata
    proof.save!
    true
  end

  # 檢查付款證明是否已審核通過
  def payment_proof_approved?
    payment_proof_status == 'approved'
  end

  # 檢查付款證明是否被拒絕
  def payment_proof_rejected?
    payment_proof_status == 'rejected'
  end

  # 檢查付款證明是否待審核
  def payment_proof_pending?
    payment_proof_status == 'pending'
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

  def set_payment_deadline
    return if payment_deadline.present? # 不要覆蓋已設定的期限
    
    # 設定3天後為付款期限
    self.payment_deadline = 3.days.from_now
    self.expires_at = payment_deadline # 用於索引查詢
  end

  def set_payment_instructions
    self.payment_instructions = set_payment_instructions_text
    # Replace both Chinese and English placeholders
    account_info = I18n.t('payment.company_account_info')
    account_info = account_info.gsub('訂單編號', order_number || 'PENDING')
    account_info = account_info.gsub('order number', order_number || 'PENDING')
    self.company_account_info = account_info
  end
end