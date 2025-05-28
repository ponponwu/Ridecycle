# 安全認證架構文件

## 🔒 安全設計原則

本專案採用了多層安全防護機制，以確保用戶資料和身份驗證的安全性。

## 🎯 JWT 雙令牌機制

### Access Token (存取令牌)

-   **儲存位置**: HttpOnly Cookie (`access_token_cookie`)
-   **有效期**: 1 小時
-   **用途**: 驗證 API 請求
-   **安全特性**:
    -   HttpOnly: 無法被 JavaScript 存取，防止 XSS 攻擊
    -   Secure: 僅在 HTTPS 環境下傳輸
    -   SameSite: 防止 CSRF 攻擊

### Refresh Token (刷新令牌)

-   **儲存位置**: HttpOnly Cookie (`refresh_token_cookie`)
-   **有效期**: 7 天
-   **用途**: 自動刷新 Access Token
-   **資料庫追蹤**: 所有 Refresh Token 都儲存在資料庫中，支援撤銷
-   **安全特性**: 與 Access Token 相同

## 🚫 避免的安全風險

### localStorage 風險

我們**不使用** localStorage 儲存任何敏感資料，避免以下風險：

1. **XSS (Cross-Site Scripting) 攻擊**

    - localStorage 可被任何 JavaScript 程式碼存取
    - 惡意腳本可竊取用戶資料

2. **持久性風險**

    - 資料永久保存直到明確清除
    - 共用電腦上的安全隱患

3. **同源政策不足**
    - 同域名下所有頁面均可存取
    - 子域名攻擊風險

## 💾 記憶體快取機制

為了提升使用者體驗，我們實作了安全的記憶體快取：

### 特性

-   **暫時性**: 僅在當前瀏覽器會話中有效
-   **自動過期**: 5 分鐘快取時間
-   **頁面刷新清除**: 重新載入頁面時自動清除
-   **背景更新**: 快取期間背景驗證用戶狀態

### 優勢

-   快速初始化載入
-   減少不必要的伺服器請求
-   保持安全性的同時提升效能
-   避免持久性儲存風險

## 🔐 CSRF 保護

### 實作方式

-   **Token 來源**: 伺服器生成
-   **儲存方式**: Cookie (`X-CSRF-Token`)
-   **請求驗證**: 每個非讀取請求都包含 CSRF token
-   **環境適配**:
    -   開發環境: `secure: false`, `sameSite: 'lax'`
    -   生產環境: `secure: true`, `sameSite: 'None'`

## 🛡️ 內容安全政策 (CSP)

### 實作層級

我們在多個層級實作了 CSP 保護：

1. **HTML Meta 標籤**: 基本 CSP 設定
2. **Nginx 標頭**: 伺服器層級的 CSP 強化
3. **Vite 開發伺服器**: 開發環境的 CSP 設定

### CSP 指令說明

-   **default-src 'self'**: 預設只允許同源資源
-   **script-src**: 允許的腳本來源
    -   `'self'`: 同源腳本
    -   `https://cdn.gpteng.co`: 開發工具
    -   `https://apis.google.com`: Google API
    -   `https://accounts.google.com`: Google 認證
-   **style-src**: 允許的樣式來源
    -   `'self'`: 同源樣式
    -   `'unsafe-inline'`: 內聯樣式（React 需要）
    -   `https://fonts.googleapis.com`: Google Fonts
-   **connect-src**: 允許的連接目標
    -   `'self'`: 同源 API
    -   後端 API 域名
    -   Google 服務
-   **img-src**: 允許的圖片來源
    -   `'self'`: 同源圖片
    -   `data:`: Base64 圖片
    -   `https:`: HTTPS 圖片
    -   `blob:`: Blob URL
-   **object-src 'none'**: 禁止所有插件
-   **base-uri 'self'**: 限制 base 標籤
-   **form-action 'self'**: 限制表單提交目標

### CSP 違規監控

-   **即時監控**: 瀏覽器自動報告 CSP 違規
-   **開發環境**: 詳細的控制台日誌
-   **生產環境**: 可整合監控服務（如 Sentry）
-   **違規處理**: 自動記錄和分析違規事件

### 環境差異

**開發環境**:

-   允許 `'unsafe-inline'` 和 `'unsafe-eval'`（開發工具需要）
-   允許 WebSocket 連接 (`ws://localhost:8080`)
-   允許 HTTP localhost 連接

**生產環境**:

-   更嚴格的腳本執行限制
-   強制 HTTPS (`upgrade-insecure-requests`)
-   只允許必要的外部資源

## 🔄 自動令牌刷新

### 機制

1. Access Token 過期時自動使用 Refresh Token 獲取新的 Access Token
2. Refresh Token 過期時用戶需要重新登入
3. 登出時撤銷所有相關的 Refresh Token

### 錯誤處理

-   401 錯誤自動嘗試刷新令牌
-   刷新失敗時清除認證狀態並重定向登入頁面
-   網路錯誤時顯示適當的錯誤訊息

## 📊 認證流程

### 登入流程

1. 用戶提交登入資料
2. 伺服器驗證憑證
3. 生成 Access Token 和 Refresh Token
4. 設置 HttpOnly Cookies
5. 前端更新認證狀態

### 頁面載入流程

1. 檢查記憶體快取 (5 分鐘內)
2. 使用快取資料立即顯示 UI
3. 背景向伺服器驗證用戶狀態
4. 更新快取和 UI 狀態

### 登出流程

1. 呼叫登出 API
2. 伺服器撤銷所有 Refresh Token
3. 清除所有 Cookies
4. 清除前端認證狀態
5. 清除記憶體快取

## 🛡️ 安全最佳實踐

### 已實作

✅ HttpOnly Cookies 防止 XSS
✅ CSRF Token 保護
✅ 自動令牌刷新
✅ 記憶體快取替代持久性儲存
✅ 適當的錯誤處理
✅ 環境特定的安全設定
✅ 內容安全政策 (CSP)
✅ 完整的安全標頭配置
✅ CSP 違規監控和報告
✅ 安全狀態即時檢查

### 建議補強

✅ 實作內容安全政策 (CSP)
🔲 定期 Refresh Token 輪換
🔲 用戶活動日誌記錄
🔲 異常登入偵測
🔲 多因素認證 (MFA)

## 🧪 測試安全性

### 確認事項

-   [ ] 無法從 JavaScript 存取認證 Cookies
-   [ ] CSRF Token 正確設置和驗證
-   [ ] 令牌過期後自動刷新
-   [ ] 登出後所有 Token 被撤銷
-   [ ] 頁面刷新後快取清除
-   [ ] 網路錯誤的適當處理

## 📝 開發注意事項

1. **不要**在 localStorage 或 sessionStorage 中儲存敏感資料
2. **不要**在前端 JavaScript 中硬編碼機密資訊
3. **確保**所有 API 請求都經過適當的身份驗證
4. **定期**檢查和更新依賴套件
5. **測試**各種攻擊場景的防護效果
