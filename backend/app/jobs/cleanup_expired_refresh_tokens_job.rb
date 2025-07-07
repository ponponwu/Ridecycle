class CleanupExpiredRefreshTokensJob < ApplicationJob
  queue_as :default

  def perform(expired_retention_days = 30, revoked_retention_days = 7)
    Rails.logger.info "開始執行清理過期 Refresh Token 任務"
    
    # 清理過期和已撤銷的 refresh tokens
    expired_count = RefreshToken.cleanup_expired_tokens!(expired_retention_days)
    revoked_count = RefreshToken.cleanup_revoked_tokens!(revoked_retention_days)
    
    Rails.logger.info "清理 Refresh Token 任務完成，共清理了 #{expired_count} 個過期 token 和 #{revoked_count} 個已撤銷 token"
    
    # 回傳處理的統計資料，方便測試和監控
    {
      expired_tokens_cleaned: expired_count,
      revoked_tokens_cleaned: revoked_count,
      total_cleaned: expired_count + revoked_count,
      cleanup_stats: RefreshToken.cleanup_stats
    }
  end
end