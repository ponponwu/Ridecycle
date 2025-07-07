class RefreshToken < ApplicationRecord
  belongs_to :user

  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :active, -> { where(revoked_at: nil).where('expires_at > ?', Time.current) }
  
  def revoked?
    revoked_at.present?
  end

  def expired?
    expires_at <= Time.current
  end

  def active?
    !revoked? && !expired?
  end

  # 清理過期的 refresh tokens
  def self.cleanup_expired_tokens!(days_ago = 30)
    cutoff_date = days_ago.days.ago
    expired_tokens = where('expires_at < ?', cutoff_date)
    
    count = expired_tokens.count
    Rails.logger.info "清理 #{count} 個過期超過 #{days_ago} 天的 refresh tokens"
    
    expired_tokens.delete_all
    count
  end

  # 清理已撤銷的 refresh tokens
  def self.cleanup_revoked_tokens!(days_ago = 7)
    cutoff_date = days_ago.days.ago
    revoked_tokens = where('revoked_at IS NOT NULL AND revoked_at < ?', cutoff_date)
    
    count = revoked_tokens.count
    Rails.logger.info "清理 #{count} 個撤銷超過 #{days_ago} 天的 refresh tokens"
    
    revoked_tokens.delete_all
    count
  end

  # 取得清理統計資料
  def self.cleanup_stats
    {
      total_tokens: count,
      active_tokens: active.count,
      expired_tokens: where('expires_at < ?', Time.current).count,
      revoked_tokens: where('revoked_at IS NOT NULL').count,
      old_expired_tokens: where('expires_at < ?', 30.days.ago).count,
      old_revoked_tokens: where('revoked_at IS NOT NULL AND revoked_at < ?', 7.days.ago).count
    }
  end
end
