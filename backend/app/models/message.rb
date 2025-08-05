class Message < ApplicationRecord
  # Note: Message content encryption removed for simplicity
  # Can be re-enabled in the future if needed
  
  belongs_to :sender, class_name: 'User', foreign_key: 'sender_id'
  belongs_to :recipient, class_name: 'User', foreign_key: 'recipient_id'
  belongs_to :bicycle # Assuming all messages must be related to a bicycle
  
  # Override common includes for Message model to prevent N+1 queries
  scope :with_common_includes, -> { includes(:sender, :recipient, :bicycle) }

  validates :content, presence: true
  validates :sender_id, presence: true
  validates :recipient_id, presence: true
  validates :bicycle_id, presence: true # Ensure bicycle_id is always present
  
  # Offer 相關驗證
  validates :offer_amount, presence: true, numericality: { greater_than: 0 }, if: :is_offer?
  validates :offer_amount, absence: true, unless: :is_offer?

  # 出價狀態枚舉 - 使用 integer 以保持索引精簡
  enum :offer_status, {
    pending: 0,     # 待回應
    accepted: 1,    # 已接受
    rejected: 2,    # 已拒絕
    expired: 3      # 已過期（可選，用於自動過期機制）
  }, prefix: :offer

  # Scopes
  scope :offers, -> { where(is_offer: true) }
  scope :regular_messages, -> { where(is_offer: false) }
  scope :pending_offers, -> { offers.where(offer_status: :pending) }
  scope :active_offers, -> { offers.where(offer_status: [:pending, :accepted]) }

  # 檢查是否為出價訊息
  def offer?
    is_offer?
  end

  # 檢查出價是否仍有效（可以被接受或拒絕）
  def offer_active?
    is_offer? && offer_pending?
  end

  # 檢查用戶是否有待回應的出價
  def self.has_pending_offer?(sender_id, recipient_id, bicycle_id)
    offers.where(
      sender_id: sender_id,
      recipient_id: recipient_id,
      bicycle_id: bicycle_id,
      offer_status: :pending
    ).exists?
  end

  # 取得用戶對特定自行車的最新出價
  def self.latest_offer_for(sender_id, recipient_id, bicycle_id)
    offers.where(
      sender_id: sender_id,
      recipient_id: recipient_id,
      bicycle_id: bicycle_id
    ).order(created_at: :desc).first
  end

  # 接受出價
  def accept_offer!
    return false unless is_offer? && offer_pending?
    
    transaction do
      # 更新當前出價為已接受
      update!(offer_status: :accepted)
      
      # 拒絕同一自行車的其他待回應出價
      Message.offers
             .where(bicycle_id: bicycle_id, offer_status: :pending)
             .where.not(id: id)
             .update_all(offer_status: Message.offer_statuses[:rejected])
    end
    
    true
  end

  # 拒絕出價
  def reject_offer!
    return false unless is_offer? && offer_pending?
    update(offer_status: :rejected)
  end

  # 格式化出價金額
  def formatted_offer_amount
    return nil unless is_offer? && offer_amount.present?
    "NT$#{offer_amount.to_i.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}"
  end

  # 出價狀態的中文顯示
  def offer_status_text
    return nil unless is_offer?
    
    case offer_status.to_s
    when 'pending'
      '待回應'
    when 'accepted'
      '已接受'
    when 'rejected'
      '已拒絕'
    when 'expired'
      '已過期'
    else
      '未知狀態'
    end
  end
end
