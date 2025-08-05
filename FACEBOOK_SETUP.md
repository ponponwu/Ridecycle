# Facebook 登入設置指南

## 1. 取得 Facebook App ID 和 App Secret

### 1.1 前往 Facebook 開發者控制台
1. 訪問 [Facebook 開發者控制台](https://developers.facebook.com/)
2. 登入你的 Facebook 帳號
3. 點擊「我的應用程式」 > 「建立應用程式」

### 1.2 創建 Facebook 應用程式
1. 選擇「消費者」類型應用程式
2. 輸入應用程式名稱和聯絡電子郵件
3. 點擊「建立應用程式 ID」

### 1.3 設置 Facebook 登入
1. 在應用程式儀表板中，找到「Facebook 登入」產品
2. 點擊「設定」
3. 選擇「網路」平台

### 1.4 配置有效的 OAuth 重定向 URI
在「Facebook 登入」> 「設定」中：
1. **有效的 OAuth 重定向 URI**：
   - `http://localhost:3000/api/v1/auth/facebook/callback` (開發環境)
   - `https://yourdomain.com/api/v1/auth/facebook/callback` (生產環境)

2. **有效的 JavaScript 來源**：
   - `http://localhost:8080` (開發環境)
   - `https://yourdomain.com` (生產環境)

### 1.5 取得應用程式憑證
1. 在應用程式儀表板的「設定」 > 「基本資料」中
2. 複製「應用程式 ID」和「應用程式密鑰」

## 2. 配置環境變數

### 2.1 後端配置 (backend/.env)
```bash
# Facebook OAuth 配置
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# 前端 URL
FRONTEND_URL=http://localhost:8080
```

### 2.2 前端配置 (frontend/.env)
```bash
# Facebook OAuth 配置
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here

# API 基礎 URL
VITE_API_BASE_URL=http://localhost:3000
```

## 3. Facebook 應用程式權限設置

### 3.1 基本權限
在「應用程式檢閱」 > 「權限和功能」中確認：
- `email` - 取得用戶電子郵件 (預設)
- `public_profile` - 取得基本公開資料 (預設)

### 3.2 應用程式模式
- **開發模式**：僅限開發者和測試用戶使用
- **上線模式**：需要通過 Facebook 審核才能公開使用

## 4. 測試 Facebook 登入

### 4.1 啟動開發伺服器
```bash
# 後端
cd backend
rails server -p 3000

# 前端
cd frontend  
npm run dev
```

### 4.2 測試流程
1. 訪問 `http://localhost:8080/login`
2. 點擊「使用 Facebook 帳號登入」按鈕
3. 完成 Facebook 登入授權
4. 驗證是否成功登入並重定向

## 5. 故障排除

### 5.1 常見錯誤
- **App ID 不匹配**: 檢查 FACEBOOK_APP_ID 是否正確
- **Invalid redirect URI**: 確認重定向 URI 設定正確
- **Permission denied**: 檢查應用程式是否在開發模式，且測試帳號已加入

### 5.2 調試技巧
- 查看瀏覽器開發者工具的 Console 和 Network 標籤
- 檢查後端日誌：`tail -f log/development.log`
- 使用 Facebook 的 [存取權杖偵錯工具](https://developers.facebook.com/tools/debug/accesstoken/)

### 5.3 網路問題
如果遇到網路連線問題：
```bash
# 測試 Facebook Graph API 連線
curl "https://graph.facebook.com/v18.0/me?access_token=YOUR_ACCESS_TOKEN"
```

## 6. 生產環境部署

### 6.1 應用程式上線
1. 在 Facebook 開發者控制台中將應用程式切換到「上線模式」
2. 提交應用程式審核（如需要額外權限）
3. 更新生產環境的網域設定

### 6.2 安全注意事項
- 永遠不要在前端暴露 Facebook App Secret
- 使用 HTTPS 進行生產環境部署
- 定期輪換 App Secret
- 監控異常的 API 調用

### 6.3 環境變數設定
確保生產環境中正確設置所有必要的環境變數，並使用安全的機密管理系統。

## 7. 支援的瀏覽器
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 8. 相關資源
- [Facebook 登入文檔](https://developers.facebook.com/docs/facebook-login/)
- [Facebook JavaScript SDK](https://developers.facebook.com/docs/javascript/reference/FB.login/)
- [Graph API 參考](https://developers.facebook.com/docs/graph-api/)