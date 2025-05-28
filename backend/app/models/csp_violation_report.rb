# app/models/csp_violation_report.rb
class CspViolationReport < ApplicationRecord
  # 關聯
  belongs_to :user, optional: true

  # 驗證
  validates :directive, presence: true
  validates :blocked_uri, presence: true
  validates :ip_address, presence: true
  validates :user_agent, presence: true
  validates :url, presence: true

  # 索引和查詢
  scope :recent, -> { where(created_at: 24.hours.ago..Time.current) }
  scope :by_directive, ->(directive) { where(directive: directive) }
  scope :by_blocked_uri, ->(uri) { where(blocked_uri: uri) }
  scope :by_environment, ->(env) { where(environment: env) }
  scope :frequent_violations, -> { 
    group(:directive, :blocked_uri)
    .having('COUNT(*) > ?', 5)
    .count 
  }

  # 類別方法
  def self.top_violations(limit = 10)
    group(:directive, :blocked_uri)
      .order('COUNT(*) DESC')
      .limit(limit)
      .count
  end

  def self.violations_by_hour(hours = 24)
    where(created_at: hours.hours.ago..Time.current)
      .group_by_hour(:created_at)
      .count
  end

  def self.violations_by_directive
    group(:directive).count
  end

  def self.violations_by_user_agent
    group(:user_agent).count
  end

  # 實例方法
  def violation_key
    "#{directive}-#{blocked_uri}"
  end

  def is_browser_extension?
    blocked_uri&.match?(/^(chrome|moz|safari)-extension:/)
  end

  def is_inline_violation?
    blocked_uri == 'inline' || blocked_uri == 'eval'
  end

  def severity
    case directive
    when 'script-src'
      'high'
    when 'object-src', 'base-uri'
      'high'
    when 'style-src', 'img-src'
      'medium'
    else
      'low'
    end
  end

  def to_alert_format
    {
      id: id,
      directive: directive,
      blocked_uri: blocked_uri,
      severity: severity,
      timestamp: created_at.iso8601,
      url: url,
      user_agent: user_agent,
      ip_address: ip_address,
      session_id: session_id,
      user_id: user_id
    }
  end

  # 清理舊記錄
  def self.cleanup_old_reports(days = 30)
    where('created_at < ?', days.days.ago).delete_all
  end

  # 檢測異常模式
  def self.detect_anomalies
    anomalies = []
    
    # 檢測突然增加的違規
    current_hour_count = where(created_at: 1.hour.ago..Time.current).count
    previous_hour_count = where(created_at: 2.hours.ago..1.hour.ago).count
    
    if current_hour_count > previous_hour_count * 3 && current_hour_count > 10
      anomalies << {
        type: 'sudden_increase',
        message: "CSP 違規數量突然增加: #{current_hour_count} (前一小時: #{previous_hour_count})",
        severity: 'high'
      }
    end
    
    # 檢測新的違規類型
    recent_directives = recent.distinct.pluck(:directive)
    historical_directives = where(created_at: 7.days.ago..1.day.ago).distinct.pluck(:directive)
    new_directives = recent_directives - historical_directives
    
    if new_directives.any?
      anomalies << {
        type: 'new_violation_types',
        message: "發現新的違規類型: #{new_directives.join(', ')}",
        severity: 'medium'
      }
    end
    
    anomalies
  end

  # 生成報告摘要
  def self.generate_summary(period = 24.hours)
    reports = where(created_at: period.ago..Time.current)
    
    {
      total_violations: reports.count,
      unique_violations: reports.distinct.count(:directive, :blocked_uri),
      top_violations: reports.group(:directive, :blocked_uri).order('COUNT(*) DESC').limit(5).count,
      violations_by_severity: {
        high: reports.select { |r| r.severity == 'high' }.count,
        medium: reports.select { |r| r.severity == 'medium' }.count,
        low: reports.select { |r| r.severity == 'low' }.count
      },
      violations_by_hour: reports.group_by_hour(:created_at).count,
      affected_users: reports.where.not(user_id: nil).distinct.count(:user_id),
      affected_sessions: reports.distinct.count(:session_id),
      period: period.inspect
    }
  end
end 