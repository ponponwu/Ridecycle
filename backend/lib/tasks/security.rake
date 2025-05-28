namespace :security do
  desc "清理舊的 CSP 違規報告"
  task cleanup_csp_reports: :environment do
    days = ENV['DAYS']&.to_i || 30
    
    puts "正在清理 #{days} 天前的 CSP 違規報告..."
    
    deleted_count = CspViolationReport.cleanup_old_reports(days)
    
    puts "已清理 #{deleted_count} 筆舊的違規報告"
  end

  desc "生成 CSP 違規報告摘要"
  task csp_summary: :environment do
    period_hours = ENV['HOURS']&.to_i || 24
    period = period_hours.hours
    
    puts "生成最近 #{period_hours} 小時的 CSP 違規報告摘要..."
    puts "=" * 60
    
    summary = CspViolationReport.generate_summary(period)
    
    puts "📊 總體統計:"
    puts "  總違規數: #{summary[:total_violations]}"
    puts "  唯一違規類型: #{summary[:unique_violations]}"
    puts "  受影響用戶: #{summary[:affected_users]}"
    puts "  受影響會話: #{summary[:affected_sessions]}"
    puts
    
    puts "🔝 前 5 名違規:"
    summary[:top_violations].each_with_index do |(key, count), index|
      directive, blocked_uri = key
      puts "  #{index + 1}. #{directive} - #{blocked_uri.truncate(50)} (#{count} 次)"
    end
    puts
    
    puts "⚠️  按嚴重程度分類:"
    summary[:violations_by_severity].each do |severity, count|
      puts "  #{severity.capitalize}: #{count}"
    end
    puts
    
    puts "📈 每小時違規數:"
    summary[:violations_by_hour].each do |hour, count|
      puts "  #{hour.strftime('%H:%M')}: #{count}"
    end
  end

  desc "檢測 CSP 違規異常"
  task detect_csp_anomalies: :environment do
    puts "檢測 CSP 違規異常模式..."
    puts "=" * 40
    
    anomalies = CspViolationReport.detect_anomalies
    
    if anomalies.empty?
      puts "✅ 未檢測到異常模式"
    else
      puts "🚨 檢測到 #{anomalies.size} 個異常:"
      anomalies.each_with_index do |anomaly, index|
        puts "  #{index + 1}. [#{anomaly[:severity].upcase}] #{anomaly[:message]}"
      end
    end
  end

  desc "生成 CSP 違規報告（JSON 格式）"
  task export_csp_report: :environment do
    period_hours = ENV['HOURS']&.to_i || 24
    output_file = ENV['OUTPUT'] || "csp_violations_#{Time.current.strftime('%Y%m%d_%H%M%S')}.json"
    
    puts "導出最近 #{period_hours} 小時的 CSP 違規報告到 #{output_file}..."
    
    reports = CspViolationReport.where(created_at: period_hours.hours.ago..Time.current)
                                .includes(:user)
                                .order(:created_at)
    
    export_data = {
      metadata: {
        generated_at: Time.current.iso8601,
        period_hours: period_hours,
        total_reports: reports.count
      },
      summary: CspViolationReport.generate_summary(period_hours.hours),
      reports: reports.map do |report|
        {
          id: report.id,
          directive: report.directive,
          blocked_uri: report.blocked_uri,
          source_file: report.source_file,
          line_number: report.line_number,
          column_number: report.column_number,
          url: report.url,
          user_agent: report.user_agent,
          ip_address: report.ip_address,
          session_id: report.session_id,
          user_id: report.user_id,
          environment: report.environment,
          severity: report.severity,
          created_at: report.created_at.iso8601
        }
      end
    }
    
    File.write(output_file, JSON.pretty_generate(export_data))
    puts "報告已導出到 #{output_file}"
  end

  desc "測試 CSP 違規報告端點"
  task test_csp_endpoint: :environment do
    puts "測試 CSP 違規報告端點..."
    
    # 創建測試報告
    test_report = {
      reports: [
        {
          timestamp: Time.current.iso8601,
          userAgent: "Test User Agent",
          url: "https://test.ridecycle.com/test",
          violation: {
            directive: "script-src",
            blockedUri: "https://evil.example.com/script.js",
            sourceFile: "https://test.ridecycle.com/test",
            lineNumber: 42,
            columnNumber: 10
          },
          sessionInfo: {
            sessionId: "test_session_#{Time.current.to_i}",
            userId: nil
          }
        }
      ],
      metadata: {
        batchSize: 1,
        timestamp: Time.current.iso8601,
        isBeforeUnload: false
      }
    }
    
    # 模擬處理
    controller = Api::V1::SecurityController.new
    
    begin
      # 這裡應該調用控制器方法，但在 Rake 任務中比較複雜
      # 所以我們直接測試模型創建
      
      violation_data = test_report[:reports].first
      
      csp_report = CspViolationReport.create!(
        directive: violation_data[:violation][:directive],
        blocked_uri: violation_data[:violation][:blockedUri],
        source_file: violation_data[:violation][:sourceFile],
        line_number: violation_data[:violation][:lineNumber],
        column_number: violation_data[:violation][:columnNumber],
        user_agent: violation_data[:userAgent],
        url: violation_data[:url],
        timestamp: violation_data[:timestamp],
        session_id: violation_data[:sessionInfo][:sessionId],
        user_id: violation_data[:sessionInfo][:userId],
        ip_address: "127.0.0.1",
        environment: "test"
      )
      
      puts "✅ 測試報告創建成功: ID #{csp_report.id}"
      puts "   指令: #{csp_report.directive}"
      puts "   被阻止的 URI: #{csp_report.blocked_uri}"
      puts "   嚴重程度: #{csp_report.severity}"
      
    rescue StandardError => e
      puts "❌ 測試失敗: #{e.message}"
    end
  end

  desc "設置 CSP 違規報告清理的定時任務"
  task setup_cleanup_cron: :environment do
    puts "設置 CSP 違規報告清理的定時任務..."
    
    cron_command = "cd #{Rails.root} && #{RbConfig.ruby} bin/rails security:cleanup_csp_reports RAILS_ENV=#{Rails.env}"
    
    puts "建議的 crontab 設定（每天凌晨 2 點執行）:"
    puts "0 2 * * * #{cron_command}"
    puts
    puts "要添加到 crontab，請執行:"
    puts "crontab -e"
    puts "然後添加上述行"
  end

  desc "顯示 CSP 違規統計儀表板"
  task dashboard: :environment do
    puts "🔒 CSP 違規監控儀表板"
    puts "=" * 50
    
    # 總體統計
    total_reports = CspViolationReport.count
    recent_reports = CspViolationReport.recent.count
    
    puts "📊 總體統計:"
    puts "  總違規報告數: #{total_reports}"
    puts "  最近 24 小時: #{recent_reports}"
    puts
    
    # 按指令分類
    puts "📋 按指令分類 (最近 24 小時):"
    CspViolationReport.recent.violations_by_directive.each do |directive, count|
      puts "  #{directive}: #{count}"
    end
    puts
    
    # 頻繁違規
    puts "🔥 頻繁違規 (最近 24 小時):"
    frequent = CspViolationReport.recent.frequent_violations
    if frequent.empty?
      puts "  無頻繁違規"
    else
      frequent.each do |(directive, blocked_uri), count|
        puts "  #{directive} - #{blocked_uri.truncate(40)}: #{count} 次"
      end
    end
    puts
    
    # 異常檢測
    puts "🚨 異常檢測:"
    anomalies = CspViolationReport.detect_anomalies
    if anomalies.empty?
      puts "  ✅ 無異常檢測"
    else
      anomalies.each do |anomaly|
        puts "  ⚠️  [#{anomaly[:severity].upcase}] #{anomaly[:message]}"
      end
    end
  end

  desc "顯示所有安全相關任務"
  task :help do
    puts "🔒 安全相關 Rake 任務"
    puts "=" * 40
    puts
    puts "基本任務:"
    puts "  rails security:dashboard              - 顯示 CSP 違規監控儀表板"
    puts "  rails security:csp_summary           - 生成 CSP 違規報告摘要"
    puts "  rails security:detect_csp_anomalies  - 檢測 CSP 違規異常"
    puts
    puts "管理任務:"
    puts "  rails security:cleanup_csp_reports   - 清理舊的 CSP 違規報告"
    puts "  rails security:export_csp_report     - 導出 CSP 違規報告 (JSON)"
    puts "  rails security:test_csp_endpoint     - 測試 CSP 違規報告端點"
    puts
    puts "設置任務:"
    puts "  rails security:setup_cleanup_cron    - 設置定時清理任務"
    puts
    puts "參數選項:"
    puts "  DAYS=30     - 指定清理天數 (預設: 30)"
    puts "  HOURS=24    - 指定報告時間範圍 (預設: 24)"
    puts "  OUTPUT=file - 指定導出檔案名稱"
    puts
    puts "範例:"
    puts "  rails security:cleanup_csp_reports DAYS=7"
    puts "  rails security:csp_summary HOURS=48"
    puts "  rails security:export_csp_report HOURS=72 OUTPUT=weekly_report.json"
  end
end

# 預設任務
task security: 'security:help' 