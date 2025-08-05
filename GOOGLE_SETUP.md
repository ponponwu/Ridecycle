# Google 登入設置指南

## 1. 取得 Google Client ID

### 1.1 前往 Google Cloud Console
1. 訪問 [Google Cloud Console](https://console.cloud.google.com/)
2. 創建新專案或選擇現有專案

### 1.2 啟用 Google+ API
1. 在左側導航中，點擊「API 和服務」 > 「程式庫」
2. 搜尋 "Google+ API" 並啟用

### 1.3 創建 OAuth 2.0 憑證
1. 在「API 和服務」 > 「憑證」中
2. 點擊「建立憑證」 > 「OAuth 2.0 用戶端 ID」
3. 選擇「網路應用程式」
4. 設定授權的 JavaScript 來源：
   - `http://localhost:8080` (開發環境)
   - `https://yourdomain.com` (生產環境)
5. 設定授權的重新導向 URI：
   - `http://localhost:3000/api/v1/auth/google/callback` (後端 callback)

## 2. 配置環境變數

### 2.1 後端配置 (backend/.env)
```bash
# Google OAuth 配置
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# 前端 URL
FRONTEND_URL=http://localhost:8080
```

### 2.2 前端配置 (frontend/.env)
```bash
# Google OAuth 配置
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# API 基礎 URL
VITE_API_BASE_URL=http://localhost:3000
```

## 3. 測試 Google 登入

### 3.1 啟動開發伺服器
```bash
# 後端
cd backend
rails server -p 3000

# 前端
cd frontend  
npm run dev
```

### 3.2 測試流程
1. 訪問 `http://localhost:8080/login`
2. 點擊「使用 Google 帳號登入」按鈕
3. 完成 Google 登入流程
4. 驗證是否成功重定向並登入

## 4. 故障排除

### 4.1 常見錯誤
- **Invalid client**: 檢查 GOOGLE_CLIENT_ID 是否正確
- **Redirect URI mismatch**: 確認重新導向 URI 設定正確
- **API not enabled**: 確認已啟用 Google+ API

### 4.2 調試技巧
- 查看瀏覽器開發者工具的 Console 和 Network 標籤
- 檢查後端日誌：`tail -f log/development.log`
- 確認環境變數已正確載入

## 5. 生產環境部署

### 5.1 更新 Google OAuth 設定
1. 在 Google Cloud Console 中添加生產環境的網域
2. 更新授權的 JavaScript 來源和重新導向 URI

### 5.2 環境變數設定
確保生產環境中正確設置了所有必要的環境變數。