namespace :security do
  desc "清理過期和已撤銷的 refresh tokens"
  task cleanup_tokens: :environment do
    puts "開始清理過期的 refresh tokens..."
    
    expired_retention_days = ENV['EXPIRED_TOKEN_RETENTION_DAYS']&.to_i || 30
    revoked_retention_days = ENV['REVOKED_TOKEN_RETENTION_DAYS']&.to_i || 7
    
    puts "清理參數："
    puts "  過期 token 保留天數: #{expired_retention_days}"
    puts "  已撤銷 token 保留天數: #{revoked_retention_days}"
    puts
    
    # 顯示清理前的統計資料
    stats_before = RefreshToken.cleanup_stats
    puts "清理前統計："
    puts "  總 tokens: #{stats_before[:total_tokens]}"
    puts "  活躍 tokens: #{stats_before[:active_tokens]}"
    puts "  過期 tokens: #{stats_before[:expired_tokens]}"
    puts "  已撤銷 tokens: #{stats_before[:revoked_tokens]}"
    puts "  待清理過期 tokens: #{stats_before[:old_expired_tokens]}"
    puts "  待清理已撤銷 tokens: #{stats_before[:old_revoked_tokens]}"
    puts
    
    # 執行清理
    expired_count = RefreshToken.cleanup_expired_tokens!(expired_retention_days)
    revoked_count = RefreshToken.cleanup_revoked_tokens!(revoked_retention_days)
    
    # 顯示清理後的統計資料
    stats_after = RefreshToken.cleanup_stats
    puts "清理完成！"
    puts "  清理過期 tokens: #{expired_count}"
    puts "  清理已撤銷 tokens: #{revoked_count}"
    puts "  總清理數量: #{expired_count + revoked_count}"
    puts
    puts "清理後統計："
    puts "  總 tokens: #{stats_after[:total_tokens]}"
    puts "  活躍 tokens: #{stats_after[:active_tokens]}"
    puts "  過期 tokens: #{stats_after[:expired_tokens]}"
    puts "  已撤銷 tokens: #{stats_after[:revoked_tokens]}"
  end

  desc "顯示 refresh token 統計資料"
  task token_stats: :environment do
    stats = RefreshToken.cleanup_stats
    puts "Refresh Token 統計資料："
    puts "  總 tokens: #{stats[:total_tokens]}"
    puts "  活躍 tokens: #{stats[:active_tokens]}"
    puts "  過期 tokens: #{stats[:expired_tokens]}"
    puts "  已撤銷 tokens: #{stats[:revoked_tokens]}"
    puts "  可清理的過期 tokens (>30天): #{stats[:old_expired_tokens]}"
    puts "  可清理的已撤銷 tokens (>7天): #{stats[:old_revoked_tokens]}"
  end

  desc "乾執行模式清理 tokens（不實際刪除）"
  task dry_run_cleanup: :environment do
    puts "乾執行模式：顯示將要清理的 tokens 但不實際刪除"
    
    expired_retention_days = ENV['EXPIRED_TOKEN_RETENTION_DAYS']&.to_i || 30
    revoked_retention_days = ENV['REVOKED_TOKEN_RETENTION_DAYS']&.to_i || 7
    
    expired_cutoff = expired_retention_days.days.ago
    revoked_cutoff = revoked_retention_days.days.ago
    
    expired_tokens = RefreshToken.where('expires_at < ?', expired_cutoff)
    revoked_tokens = RefreshToken.where('revoked_at IS NOT NULL AND revoked_at < ?', revoked_cutoff)
    
    puts "將要清理的過期 tokens（過期超過 #{expired_retention_days} 天）: #{expired_tokens.count}"
    puts "將要清理的已撤銷 tokens（撤銷超過 #{revoked_retention_days} 天）: #{revoked_tokens.count}"
    puts "總計將清理: #{expired_tokens.count + revoked_tokens.count}"
    
    if expired_tokens.any?
      puts "\n過期 tokens 詳細資訊："
      expired_tokens.includes(:user).each do |token|
        puts "  Token ID: #{token.id}, 用戶: #{token.user.email}, 過期時間: #{token.expires_at}"
      end
    end
    
    if revoked_tokens.any?
      puts "\n已撤銷 tokens 詳細資訊："
      revoked_tokens.includes(:user).each do |token|
        puts "  Token ID: #{token.id}, 用戶: #{token.user.email}, 撤銷時間: #{token.revoked_at}"
      end
    end
  end

  desc "強制清理所有過期和已撤銷的 tokens（不考慮天數限制）"
  task force_cleanup: :environment do
    puts "警告：這將清理所有過期和已撤銷的 tokens，不考慮天數限制"
    puts "是否確定要繼續？(y/N)"
    
    input = STDIN.gets.chomp
    if input.downcase == 'y'
      expired_count = RefreshToken.where('expires_at < ?', Time.current).delete_all
      revoked_count = RefreshToken.where('revoked_at IS NOT NULL').delete_all
      
      puts "強制清理完成！"
      puts "  清理過期 tokens: #{expired_count}"
      puts "  清理已撤銷 tokens: #{revoked_count}"
      puts "  總清理數量: #{expired_count + revoked_count}"
    else
      puts "取消清理操作"
    end
  end
end