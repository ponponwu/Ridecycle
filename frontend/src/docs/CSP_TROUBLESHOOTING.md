# 🚨 CSP 故障排除指南

## 常見問題：Active Storage 圖片被 CSP 阻止

### 問題症狀

```
被阻止的 URI: http://localhost:3000/rails/active_storage/blobs/redirect/...
違規指令: img-src
```

### 🔍 診斷步驟

#### 1. 使用 CSP 除錯器

1. 在開發環境中，點擊左下角的紅色 🐛 按鈕
2. 檢查「Meta 標籤 CSP」是否存在
3. 確認「img-src 檢查」顯示 ✅ 包含基礎 URL

#### 2. 檢查瀏覽器開發者工具

1. 打開 Console 面板
2. 查看是否有 CSP 違規警告
3. 檢查 Network 面板中的圖片請求狀態

#### 3. 驗證動態 CSP 配置

1. 在 Console 中執行：

```javascript
document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content')
```

2. 確認輸出包含您的 API 基礎 URL

### 🛠️ 解決方案

#### 方案 1: 強制重新載入

1. 清除瀏覽器快取 (Ctrl+Shift+R 或 Cmd+Shift+R)
2. 重新啟動開發伺服器
3. 檢查 CSP 除錯器確認配置正確

#### 方案 2: 檢查環境變數

1. 確認 `VITE_API_URL` 設定正確：

```bash
echo $VITE_API_URL
# 應該輸出: http://localhost:3000/api/v1/ 或您的自定義 URL
```

2. 如果未設定，創建 `.env.local` 檔案：

```bash
VITE_API_URL=http://localhost:3000/api/v1/
```

#### 方案 3: 手動驗證 CSP 配置

1. 檢查 `src/utils/dynamicCSP.ts` 是否正確導入
2. 確認 `main.tsx` 中調用了 `updateCSPMetaTag()`
3. 檢查 Console 是否有 CSP 生成日誌

#### 方案 4: 臨時禁用 CSP（僅用於測試）

**⚠️ 警告：僅用於診斷，不要在生產環境使用**

1. 暫時註釋掉 `main.tsx` 中的 CSP 更新：

```typescript
// updateCSPMetaTag()
```

2. 重新載入頁面測試圖片是否正常載入
3. 如果圖片正常載入，說明問題在於 CSP 配置

### 🔧 進階診斷

#### 檢查 API 客戶端配置

1. 確認 `src/api/client.ts` 中的 `API_URL` 配置：

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/'
```

2. 檢查實際的 API 請求 URL 是否與 CSP 配置一致

#### 檢查圖片 URL 格式

1. 在 Network 面板中檢查被阻止的圖片 URL
2. 確認 URL 的域名部分與 CSP 中的 `img-src` 一致

例如：

-   圖片 URL: `http://localhost:3000/rails/active_storage/blobs/...`
-   CSP img-src 應包含: `http://localhost:3000`

### 📝 常見錯誤配置

#### 錯誤 1: 協議不匹配

```
❌ 錯誤: API URL 使用 https，但開發環境使用 http
✅ 正確: 確保協議一致
```

#### 錯誤 2: 端口號遺漏

```
❌ 錯誤: CSP 包含 http://localhost，但 API 使用 http://localhost:3000
✅ 正確: 確保端口號完整
```

#### 錯誤 3: 路徑包含在基礎 URL 中

```
❌ 錯誤: 基礎 URL 包含路徑 http://localhost:3000/api/v1/
✅ 正確: 基礎 URL 只包含域名 http://localhost:3000
```

### 🧪 測試驗證

#### 快速測試腳本

在瀏覽器 Console 中執行：

```javascript
// 檢查當前 CSP 配置
const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content')
console.log('當前 CSP:', csp)

// 檢查 img-src 是否包含 localhost
const includesLocalhost = csp?.includes('http://localhost:3000')
console.log('img-src 包含 localhost:3000:', includesLocalhost)

// 檢查 API URL
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/'
console.log('API URL:', apiUrl)
```

#### 預期輸出

```
當前 CSP: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co https://apis.google.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob: http://localhost:3000; connect-src 'self' http://localhost:3000 https://accounts.google.com ws://localhost:8080; frame-src 'self' https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self'

img-src 包含 localhost:3000: true
API URL: http://localhost:3000/api/v1/
```

### 🆘 如果問題仍然存在

1. **檢查後端配置**: 確認 Rails Active Storage 配置正確
2. **檢查 CORS 設定**: 確認後端允許前端域名
3. **檢查防火牆**: 確認沒有網路層面的阻擋
4. **重新安裝依賴**: `npm ci` 重新安裝所有依賴
5. **聯繫開發團隊**: 提供 CSP 除錯器的完整輸出

### 📚 相關文件

-   [DYNAMIC_CSP_SOLUTION.md](./DYNAMIC_CSP_SOLUTION.md) - 動態 CSP 解決方案
-   [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 部署指南
-   [SECURITY.md](./SECURITY.md) - 完整安全實作指南
