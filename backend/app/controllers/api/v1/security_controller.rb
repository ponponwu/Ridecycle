# app/controllers/api/v1/security_controller.rb
class Api::V1::SecurityController < ApplicationController
  # 跳過 CSRF 驗證，因為 CSP 違規報告是瀏覽器自動發送的
  skip_before_action :verify_authenticity_token, only: [:csp_violations]
  # 跳過認證，因為 CSP 違規報告可能在用戶未登入時發生
  skip_before_action :authenticate_user!, only: [:csp_violations]

  # POST /api/v1/security/csp-violations
  # 接收 CSP 違規報告
  def csp_violations
    begin
      # 記錄請求資訊
      Rails.logger.info "CSP 違規報告接收: IP=#{request.remote_ip}, User-Agent=#{request.user_agent}"
      
      # 解析報告資料
      reports_data = params[:reports] || []
      metadata = params[:metadata] || {}
      
      # 驗證資料格式
      unless reports_data.is_a?(Array)
        return render json: { success: false, error: 'Invalid reports format' }, status: :bad_request
      end
      
      # 處理每個違規報告
      processed_reports = []
      reports_data.each do |report_data|
        processed_report = process_csp_violation_report(report_data)
        processed_reports << processed_report if processed_report
      end
      
      # 記錄處理結果
      Rails.logger.info "CSP 違規報告處理完成: 接收 #{reports_data.size} 個，處理 #{processed_reports.size} 個"
      
      render json: {
        success: true,
        data: {
          received: reports_data.size,
          processed: processed_reports.size,
          timestamp: Time.current.iso8601
        }
      }, status: :ok
      
    rescue StandardError => e
      Rails.logger.error "CSP 違規報告處理錯誤: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      
      render json: {
        success: false,
        error: 'Internal server error'
      }, status: :internal_server_error
    end
  end

  # GET /api/v1/security/status
  # 獲取安全狀態資訊
  def status
    render json: {
      success: true,
      data: {
        csp_enabled: true,
        https_enforced: Rails.env.production?,
        security_headers_enabled: true,
        timestamp: Time.current.iso8601
      }
    }
  end

  # GET /api/v1/security/violations/stats
  # 獲取違規統計資訊（需要管理員權限）
  def violation_stats
    # 檢查管理員權限
    unless current_user&.admin?
      return render json: { success: false, error: 'Unauthorized' }, status: :unauthorized
    end

    # 獲取最近 24 小時的違規統計
    stats = CspViolationReport.where(created_at: 24.hours.ago..Time.current)
                              .group(:directive)
                              .count

    render json: {
      success: true,
      data: {
        total_violations: stats.values.sum,
        violations_by_directive: stats,
        time_range: '24 hours',
        timestamp: Time.current.iso8601
      }
    }
  end

  private

  def process_csp_violation_report(report_data)
    # 驗證必要欄位
    return nil unless report_data.is_a?(Hash)
    return nil unless report_data['violation'].is_a?(Hash)
    
    violation = report_data['violation']
    session_info = report_data['sessionInfo'] || {}
    
    # 檢查是否應該忽略此違規
    return nil if should_ignore_violation?(violation)
    
    # 創建違規報告記錄
    csp_report = CspViolationReport.create!(
      # 違規資訊
      directive: violation['directive'],
      blocked_uri: violation['blockedUri'],
      source_file: violation['sourceFile'],
      line_number: violation['lineNumber'],
      column_number: violation['columnNumber'],
      
      # 請求資訊
      user_agent: report_data['userAgent'],
      url: report_data['url'],
      timestamp: report_data['timestamp'],
      
      # 會話資訊
      session_id: session_info['sessionId'],
      user_id: session_info['userId'],
      ip_address: request.remote_ip,
      
      # 額外資訊
      referrer: request.referrer,
      environment: Rails.env
    )
    
    # 檢查是否需要發送警報
    check_violation_threshold(csp_report)
    
    csp_report
  rescue StandardError => e
    Rails.logger.error "處理單個 CSP 違規報告失敗: #{e.message}"
    nil
  end

  def should_ignore_violation?(violation)
    directive = violation['directive']
    blocked_uri = violation['blockedUri']
    
    # 忽略瀏覽器擴展
    return true if blocked_uri&.match?(/^(chrome|moz|safari)-extension:/)
    
    # 忽略 about:blank
    return true if blocked_uri == 'about:blank'
    
    # 忽略空的 blocked_uri
    return true if blocked_uri.blank?
    
    # 可以根據需要添加更多忽略規則
    false
  end

  def check_violation_threshold(csp_report)
    # 檢查最近 5 分鐘內相同類型的違規數量
    recent_violations = CspViolationReport.where(
      directive: csp_report.directive,
      blocked_uri: csp_report.blocked_uri,
      created_at: 5.minutes.ago..Time.current
    ).count
    
    # 如果違規數量超過閾值，發送警報
    if recent_violations > 10
      Rails.logger.warn "CSP 違規頻率過高: #{csp_report.directive} - #{csp_report.blocked_uri} (#{recent_violations} 次)"
      
      # 這裡可以整合警報系統
      # SecurityAlertService.send_csp_violation_alert(csp_report, recent_violations)
    end
  end
end 