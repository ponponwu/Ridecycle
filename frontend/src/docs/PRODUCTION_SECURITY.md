# 生產環境安全配置指南

## 🚀 生產環境部署前檢查清單

### 1. **安全檢查命令使用時機**

#### 開發階段

```bash
# 每次修改安全配置後
npm run security:check

# 添加新的外部資源時
npm run security:check

# 修改 CSP 設定後
npm run security:check
```

#### CI/CD 流程中

```bash
# 在建置前檢查
npm run security:full

# 部署前驗證
npm run security:check
```

#### 定期維護

```bash
# 每週執行一次完整檢查
npm run security:full

# 更新依賴套件後
npm run security:audit
```

#### 問題排查

```bash
# 當發現安全問題時
npm run security:check

# 檢查 CSP 違規原因
npm run security:check
```

### 2. **生產環境特別配置**

#### 環境變數設定

```bash
# .env.production
NODE_ENV=production
VITE_API_URL=https://api.ridecycle.com
VITE_CSP_REPORT_URI=/api/v1/security/csp-violations
VITE_ENABLE_CSP_MONITORING=true
```

#### Nginx 生產配置

```nginx
# /etc/nginx/sites-available/ridecycle
server {
    listen 443 ssl http2;
    server_name ridecycle.com;

    # SSL 配置
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # 安全標頭
    include /etc/nginx/conf.d/security-headers.conf;

    # 應用配置
    root /var/www/ridecycle/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 安全標頭配置檔案

```nginx
# /etc/nginx/conf.d/security-headers.conf

# Content Security Policy
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' https://apis.google.com https://accounts.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://api.ridecycle.com https://accounts.google.com;
    frame-src 'self' https://accounts.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
    report-uri /api/v1/security/csp-violations;
" always;

# HTTP Strict Transport Security
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# 防止點擊劫持
add_header X-Frame-Options "DENY" always;

# 防止 MIME 類型嗅探
add_header X-Content-Type-Options "nosniff" always;

# XSS 保護
add_header X-XSS-Protection "1; mode=block" always;

# Referrer 政策
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# 權限政策
add_header Permissions-Policy "
    geolocation=(),
    microphone=(),
    camera=(),
    payment=(),
    usb=(),
    magnetometer=(),
    gyroscope=(),
    accelerometer=()
" always;

# 隱藏伺服器資訊
server_tokens off;
```

### 3. **CSP 違規監控（無 Sentry）**

#### 後端監控設定

##### 定時任務設定

```bash
# 添加到 crontab (crontab -e)
# 每天凌晨 2 點清理舊報告
0 2 * * * cd /var/www/ridecycle/backend && /usr/bin/ruby bin/rails security:cleanup_csp_reports RAILS_ENV=production

# 每小時檢測異常
0 * * * * cd /var/www/ridecycle/backend && /usr/bin/ruby bin/rails security:detect_csp_anomalies RAILS_ENV=production

# 每天早上 8 點生成報告摘要
0 8 * * * cd /var/www/ridecycle/backend && /usr/bin/ruby bin/rails security:csp_summary RAILS_ENV=production
```

##### 日誌監控設定

```ruby
# config/environments/production.rb
config.log_level = :info

# 設定日誌輪轉
config.logger = ActiveSupport::Logger.new(
  Rails.root.join('log', 'production.log'),
  1, # 保留 1 個舊檔案
  50.megabytes # 每個檔案最大 50MB
)

# CSP 違規日誌
config.after_initialize do
  Rails.logger.info "CSP 違規監控已啟用"
end
```

#### 監控腳本

##### 每日安全報告腳本

```bash
#!/bin/bash
# /usr/local/bin/daily-security-report.sh

cd /var/www/ridecycle/backend

# 生成昨日報告
rails security:export_csp_report HOURS=24 OUTPUT="/var/log/ridecycle/csp-$(date +%Y%m%d).json" RAILS_ENV=production

# 檢測異常
ANOMALIES=$(rails security:detect_csp_anomalies RAILS_ENV=production)

# 如果有異常，發送警報
if [[ $ANOMALIES == *"檢測到"* ]]; then
    echo "CSP 違規異常檢測報告 - $(date)" | mail -s "RideCycle 安全警報" admin@ridecycle.com
    echo "$ANOMALIES" | mail -s "CSP 違規詳情" admin@ridecycle.com
fi

# 清理超過 30 天的報告
rails security:cleanup_csp_reports DAYS=30 RAILS_ENV=production
```

##### 即時監控腳本

```bash
#!/bin/bash
# /usr/local/bin/csp-monitor.sh

# 監控 CSP 違規日誌
tail -f /var/www/ridecycle/backend/log/production.log | grep "CSP 違規" | while read line; do
    echo "$(date): $line" >> /var/log/ridecycle/csp-violations.log

    # 如果是高嚴重程度違規，立即發送警報
    if [[ $line == *"script-src"* ]] || [[ $line == *"object-src"* ]]; then
        echo "高嚴重程度 CSP 違規: $line" | mail -s "緊急安全警報" admin@ridecycle.com
    fi
done
```

#### 監控儀表板

##### 簡單的監控頁面

```html
<!-- /var/www/ridecycle/monitoring/index.html -->
<!DOCTYPE html>
<html>
    <head>
        <title>RideCycle 安全監控</title>
        <meta http-equiv="refresh" content="300" />
        <!-- 每 5 分鐘刷新 -->
    </head>
    <body>
        <h1>CSP 違規監控儀表板</h1>
        <div id="stats"></div>

        <script>
            async function loadStats() {
                try {
                    const response = await fetch('/api/v1/security/violations/stats')
                    const data = await response.json()

                    document.getElementById('stats').innerHTML = `
                    <h2>最近 24 小時統計</h2>
                    <p>總違規數: ${data.data.total_violations}</p>
                    <h3>按指令分類:</h3>
                    <ul>
                        ${Object.entries(data.data.violations_by_directive)
                            .map(([directive, count]) => `<li>${directive}: ${count}</li>`)
                            .join('')}
                    </ul>
                `
                } catch (error) {
                    console.error('載入統計失敗:', error)
                }
            }

            loadStats()
            setInterval(loadStats, 300000) // 每 5 分鐘更新
        </script>
    </body>
</html>
```

### 4. **警報系統設定**

#### 電子郵件警報

```ruby
# app/services/security_alert_service.rb
class SecurityAlertService
  def self.send_csp_violation_alert(report, count)
    return unless Rails.env.production?

    AdminMailer.csp_violation_alert(report, count).deliver_now
  end

  def self.send_daily_security_summary
    summary = CspViolationReport.generate_summary(24.hours)
    AdminMailer.daily_security_summary(summary).deliver_now
  end
end
```

#### Slack 整合（可選）

```ruby
# config/initializers/slack.rb
if Rails.env.production?
  SLACK_WEBHOOK_URL = ENV['SLACK_WEBHOOK_URL']

  def send_slack_alert(message)
    return unless SLACK_WEBHOOK_URL

    payload = {
      text: message,
      channel: '#security-alerts',
      username: 'RideCycle Security Bot'
    }

    Net::HTTP.post_form(
      URI(SLACK_WEBHOOK_URL),
      payload: payload.to_json
    )
  end
end
```

### 5. **效能優化**

#### 資料庫優化

```sql
-- 定期清理舊資料
DELETE FROM csp_violation_reports WHERE created_at < NOW() - INTERVAL '30 days';

-- 優化索引
ANALYZE csp_violation_reports;
REINDEX TABLE csp_violation_reports;
```

#### 批次處理優化

```ruby
# config/environments/production.rb
# 調整批次大小以平衡效能和記憶體使用
config.after_initialize do
  SECURITY_CONFIG[:production][:batchReporting][:maxBatchSize] = 20
  SECURITY_CONFIG[:production][:batchReporting][:flushInterval] = 60000 # 1 分鐘
end
```

### 6. **部署檢查清單**

#### 部署前

-   [ ] 執行 `npm run security:full`
-   [ ] 檢查所有環境變數設定
-   [ ] 驗證 SSL 憑證有效性
-   [ ] 測試 CSP 設定不會阻止正常功能
-   [ ] 確認監控腳本權限正確

#### 部署後

-   [ ] 驗證安全標頭正確設定
-   [ ] 測試 CSP 違規報告端點
-   [ ] 檢查日誌輪轉設定
-   [ ] 驗證定時任務正常運行
-   [ ] 測試警報系統

#### 定期檢查

-   [ ] 每週檢查 CSP 違規趨勢
-   [ ] 每月更新安全依賴
-   [ ] 每季度檢查安全配置
-   [ ] 每年更新 SSL 憑證

### 7. **故障排除**

#### 常見問題

**CSP 違規過多**

```bash
# 檢查最頻繁的違規
rails security:csp_summary HOURS=1

# 檢查是否有新的外部資源
grep -r "https://" frontend/src/ | grep -v "api.ridecycle.com"
```

**監控系統無回應**

```bash
# 檢查後端服務狀態
systemctl status ridecycle-backend

# 檢查資料庫連接
rails db:migrate:status RAILS_ENV=production

# 檢查磁碟空間
df -h /var/log/ridecycle/
```

**效能問題**

```bash
# 檢查資料庫大小
rails runner "puts CspViolationReport.count" RAILS_ENV=production

# 清理舊資料
rails security:cleanup_csp_reports DAYS=7 RAILS_ENV=production
```

### 8. **安全最佳實踐**

#### 定期更新

-   每月更新依賴套件
-   每季度檢查 CSP 設定
-   每年進行安全審計

#### 監控策略

-   設定合理的警報閾值
-   定期檢查誤報
-   保持監控系統簡潔

#### 資料保護

-   定期備份違規報告
-   限制敏感資料存取
-   遵循資料保留政策

這個配置提供了完整的生產環境安全監控解決方案，即使沒有 Sentry 等第三方服務也能有效監控 CSP 違規。
