# Ride Cycle Backend API

二手腳踏車交易平台後端 API，基於 Ruby on Rails 建構。

## 環境需求

* Ruby 3.0+
* PostgreSQL 12+
* Redis (可選，用於快取)

## 安裝與設定

1. **安裝相依套件**
   ```bash
   bundle install
   ```

2. **環境變數設定**
   ```bash
   cp .env.example .env
   # 編輯 .env 檔案，設定資料庫連線和其他必要參數
   ```

3. **資料庫設定**
   ```bash
   rails db:create
   rails db:migrate
   rails db:seed
   ```

## 重要環境變數

### JWT 安全設定
- `JWT_SECRET_KEY`: JWT 簽署金鑰
- `JWT_REFRESH_SECRET`: Refresh Token 簽署金鑰

### Cookie 安全設定
- `COOKIE_DOMAIN`: 生產環境 Cookie 域名限制 (例如: '.yourdomain.com')
  - 開發環境請留空或註解掉
  - 生產環境設定為你的主域名

### 資料庫設定
- `DATABASE_URL`: PostgreSQL 連線字串

## 安全特性

### JWT 雙令牌機制
- **Access Token**: 短期 (1小時)，存於 HttpOnly Cookie
- **Refresh Token**: 長期 (7天)，存於 HttpOnly Cookie + 資料庫管理

### Token Binding 機制
- 每個 token 都與用戶的 User-Agent 和 IP 子網綁定
- 防止 token 被竊取後在其他環境使用
- 自動向後兼容舊版 token

### Cookie 安全設定
- 生產環境使用 `SameSite: strict`
- 支援域名限制
- HttpOnly 防止 XSS 攻擊

## 運行

### 開發環境
```bash
rails server
```

### 測試
```bash
# 運行所有測試
bundle exec rspec

# 運行特定測試
bundle exec rspec spec/controllers/
```

## API 文檔

API 使用 JSON:API 規範，主要端點包括：

- `POST /api/v1/register` - 用戶註冊
- `POST /api/v1/login` - 用戶登入  
- `POST /api/v1/logout` - 用戶登出
- `POST /api/v1/auth/refresh` - 刷新 Token
- `GET /api/v1/me` - 獲取當前用戶資訊

## 部署注意事項

### 生產環境設定

1. **環境變數**
   ```bash
   RAILS_ENV=production
   COOKIE_DOMAIN=.yourdomain.com
   JWT_SECRET_KEY=your_strong_secret_key
   JWT_REFRESH_SECRET=your_strong_refresh_secret
   ```

2. **SSL/HTTPS**
   - 必須啟用 HTTPS
   - Cookie 設定會自動在生產環境啟用 `secure` 標記

3. **資料庫維護**
   - 定期清理過期的 refresh tokens
   - 監控異常的 token 使用模式

## Token 清理功能

### 自動清理
系統會自動清理過期和已撤銷的 refresh tokens：
- 每週自動執行清理作業
- 預設保留過期 tokens 30天，已撤銷 tokens 7天
- 透過環境變數配置保留期間

### 手動清理命令

```bash
# 查看 token 統計資料
rails security:token_stats

# 乾執行模式（不實際刪除）
rails security:dry_run_cleanup

# 執行清理作業
rails security:cleanup_tokens

# 強制清理所有過期和已撤銷的 tokens
rails security:force_cleanup
```

### 清理配置

在 `.env` 檔案中設定保留期間：
```bash
# 過期 token 保留天數（預設：30天）
EXPIRED_TOKEN_RETENTION_DAYS=30

# 已撤銷 token 保留天數（預設：7天）
REVOKED_TOKEN_RETENTION_DAYS=7
```

### 背景作業

清理功能也可透過背景作業執行：
```bash
# 在 Rails console 中執行
CleanupExpiredRefreshTokensJob.perform_now

# 或使用自訂參數
CleanupExpiredRefreshTokensJob.perform_now(30, 7)
```

## 故障排除

### Token Binding 問題
如果用戶在正常使用中遇到認證失敗：
1. 檢查日誌中的 "Token binding mismatch" 警告
2. 確認用戶沒有使用代理或VPN導致IP頻繁變更
3. 檢查 User-Agent 是否被修改

### Cookie 問題
如果 Cookie 無法正常設定：
1. 確認 `COOKIE_DOMAIN` 設定正確
2. 檢查是否啟用了 HTTPS（生產環境必需）
3. 驗證前端域名是否符合 SameSite 政策

### Token 清理問題
如果清理作業失敗：
1. 檢查資料庫連線狀態
2. 確認 refresh_tokens 表的索引完整性
3. 查看 Rails 日誌了解具體錯誤
4. 使用 `rails security:token_stats` 檢查 token 狀態
