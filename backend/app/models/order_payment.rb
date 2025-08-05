class OrderPayment < ApplicationRecord
  include StrictLoadingConcern
  
  belongs_to :order

  # 付款證明檔案關聯
  has_many_attached :payment_proofs

  # Payment status enum
  enum :status, {
    pending: 0,
    awaiting_confirmation: 1, # 待確認 (已上傳付款證明)
    paid: 2,
    failed: 3,
    refunded: 4
  }, prefix: true

  # Payment method enum
  enum :method, {
    bank_transfer: 0,
    credit_card: 1,
    paypal: 2,
    cash_on_delivery: 3
  }, prefix: true

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :deadline, presence: true
  validates :expires_at, presence: true
  validates :status, presence: true
  validates :method, presence: true

  # Callbacks
  before_validation :set_expires_at, on: :create
  before_save :set_payment_instructions
  before_save :set_timestamps_on_status_change
  after_update :notify_order_of_payment_change

  # Scopes
  scope :pending_payment, -> { where(status: :pending) }
  scope :expired, -> { where('expires_at < ?', Time.current) }
  scope :pending_and_expired, -> { pending_payment.expired }
  scope :awaiting_confirmation, -> { where(status: :awaiting_confirmation) }

  # 檢查是否已過期
  def expired?
    expires_at.present? && expires_at < Time.current
  end

  # 取得剩餘付款時間（以小時為單位）
  def remaining_payment_hours
    return 0 if deadline.blank? || deadline < Time.current
    
    ((deadline - Time.current) / 1.hour).ceil
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

  # 付款證明相關方法
  
  # 檢查是否有有效的付款證明
  def has_payment_proof?
    payment_proofs.attached? && payment_proofs.any?
  end

  # 取得最新的付款證明
  def latest_payment_proof
    return nil unless has_payment_proof?
    payment_proofs.includes(:blob).order(created_at: :desc).first
  end

  # 取得付款證明狀態
  def payment_proof_status
    proof = latest_payment_proof
    return 'none' unless proof
    
    # 對 proof attachment 對象禁用 strict loading，安全存取 metadata
    proof.strict_loading!(false) if proof.respond_to?(:strict_loading!)
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

  # 處理付款成功
  def mark_as_paid!(payment_reference = nil)
    update!(
      status: :paid,
      paid_at: Time.current,
      payment_id: payment_reference || payment_id
    )
  end

  # 處理付款失敗
  def mark_as_failed!(reason = nil)
    update!(
      status: :failed,
      failed_at: Time.current,
      failure_reason: reason
    )
  end

  # 設定付款說明
  def set_payment_instructions_text
    if method_bank_transfer?
      I18n.t('payment.instructions') + "\n\n" + 
      I18n.t('payment.company_account_info').gsub('訂單編號', order.order_number || 'PENDING')
    else
      ''
    end
  end

  # 自動取消過期付款 - 增強版本
  def self.cancel_expired_payments!
    expired_payments = pending_and_expired.includes(:order)
    cancelled_count = 0
    
    expired_payments.find_each do |payment|
      OrderPayment.transaction do
        if payment.mark_as_failed!('Payment deadline expired')
          cancelled_count += 1
          Rails.logger.info "付款 #{payment.id} (訂單: #{payment.order.order_number}) 因超期而自動標記為失敗"
          
          # 通知相關系統組件
          payment.notify_payment_cancellation
        end
      end
    rescue StandardError => e
      Rails.logger.error "取消過期付款 #{payment&.id} 時發生錯誤: #{e.message}"
    end
    
    Rails.logger.info "自動標記了 #{cancelled_count} 個過期付款為失敗"
    cancelled_count
  end
  
  # 批次處理過期付款 - 提高效能
  def self.cancel_expired_payments_batch!
    batch_size = 100
    total_cancelled = 0
    
    loop do
      expired_payments = pending_and_expired.includes(:order).limit(batch_size)
      break if expired_payments.empty?
      
      batch_cancelled = 0
      expired_payments.find_each do |payment|
        OrderPayment.transaction do
          if payment.mark_as_failed!('Payment deadline expired')
            batch_cancelled += 1
            payment.notify_payment_cancellation
          end
        end
      rescue StandardError => e
        Rails.logger.error "批次取消過期付款 #{payment&.id} 時發生錯誤: #{e.message}"
      end
      
      total_cancelled += batch_cancelled
      Rails.logger.info "處理了一批 #{batch_cancelled} 個過期付款"
      
      # 避免無限循環
      break if batch_cancelled == 0
    end
    
    Rails.logger.info "批次處理完成，共標記了 #{total_cancelled} 個過期付款為失敗"
    total_cancelled
  end
  
  # 通知付款取消
  def notify_payment_cancellation
    # 這裡可以添加通知邏輯，如發送郵件、推送通知等
    Rails.logger.info "付款 #{id} 已取消，訂單: #{order.order_number}"
    
    # 可以在這裡添加其他業務邏輯，如:
    # - 發送取消通知郵件給用戶
    # - 更新庫存狀態
    # - 記錄審計日誌
  rescue StandardError => e
    Rails.logger.error "通知付款取消時發生錯誤: #{e.message}"
  end

  private

  def set_expires_at
    self.expires_at = deadline if deadline.present?
  end

  def set_payment_instructions
    self.instructions = set_payment_instructions_text if instructions.blank?
    
    if company_account_info.blank?
      # Replace both Chinese and English placeholders
      account_info = I18n.t('payment.company_account_info')
      account_info = account_info.gsub('訂單編號', order.order_number || 'PENDING')
      account_info = account_info.gsub('order number', order.order_number || 'PENDING')
      self.company_account_info = account_info
    end
  end

  def set_timestamps_on_status_change
    if status_changed?
      case status
      when 'paid'
        self.paid_at = Time.current if paid_at.blank?
      when 'failed'
        self.failed_at = Time.current if failed_at.blank?
      end
    end
  end

  def notify_order_of_payment_change
    # Trigger order to update bicycle status when payment status changes
    return unless status_changed?
    
    order.update_bicycle_status_on_payment_change if order
  rescue StandardError => e
    Rails.logger.error "Failed to notify order of payment change: #{e.message}"
  end
end
