# 🔒 動態 CSP 解決方案

## 🚨 解決的問題

### 1. 生產環境 API URL 配置問題

**問題**: 在 Railway 等平台部署時，需要通過 `VITE_API_URL` 環境變數指定 API 域名，但靜態 CSP 配置無法適應不同的部署環境。

**解決方案**: 實作動態 CSP 配置系統，根據環境變數自動調整 CSP 規則。

### 2. 圖片載入被 CSP 阻止問題

**問題**:

```
違規指令: img-src
被阻止的 URI: http://localhost:3000/rails/active_storage/blobs/redirect/...
```

**解決方案**: 動態 CSP 系統自動將 API 基礎域名添加到 `img-src` 指令中。

## ✅ 實作的解決方案

### 1. 動態 CSP 配置系統

#### 核心檔案

-   **`src/utils/dynamicCSP.ts`**: 動態 CSP 生成器
-   **`src/components/security/CSPConfigChecker.tsx`**: 開發環境配置檢查器

#### 工作原理

```typescript
// 1. 讀取環境變數
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/'

// 2. 提取基礎域名
const baseUrl = extractBaseUrl(apiUrl) // https://api.ridecycle.com

// 3. 動態生成 CSP 規則
const cspConfig = {
    'img-src': ['self', 'data:', 'https:', 'blob:', baseUrl],
    'connect-src': ['self', baseUrl, 'https://accounts.google.com'],
}
```

### 2. 環境適應性

#### 開發環境

```bash
VITE_API_URL=http://localhost:3000/api/v1/
# 生成的 CSP 包含: http://localhost:3000
```

#### 生產環境 (Railway)

```bash
VITE_API_URL=https://ridecycle-backend-production.railway.app/api/v1/
# 生成的 CSP 包含: https://ridecycle-backend-production.railway.app
```

#### 自定義域名

```bash
VITE_API_URL=https://api.ridecycle.com/api/v1/
# 生成的 CSP 包含: https://api.ridecycle.com
```

### 3. 自動化配置更新

#### 應用啟動時

```typescript
// main.tsx
import { updateCSPMetaTag } from './utils/dynamicCSP'

// 動態更新 CSP 配置
updateCSPMetaTag()
```

#### 即時配置檢查

-   開發環境中提供 CSP 配置檢查器 ⚙️
-   顯示當前 API URL 和生成的 CSP 規則
-   可複製配置用於除錯

## 🌐 部署平台支援

### Railway

```bash
# 在 Railway Variables 中設定
VITE_API_URL=https://your-backend-app.railway.app/api/v1/
```

### Vercel

```bash
# 在 Environment Variables 中設定
VITE_API_URL=https://api.ridecycle.com/api/v1/
```

### Netlify

```bash
# 在 Environment variables 中設定
VITE_API_URL=https://api.ridecycle.com/api/v1/
```

### Docker

```dockerfile
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
```

## 🔧 使用方式

### 1. 開發環境

```bash
# 使用預設 localhost
npm run dev

# 使用自定義 API URL
VITE_API_URL=https://staging-api.ridecycle.com/api/v1/ npm run dev
```

### 2. 建置時配置

```bash
# 設定環境變數後建置
VITE_API_URL=https://api.ridecycle.com/api/v1/ npm run build
```

### 3. 配置檢查

-   開發環境中點擊左下角 ⚙️ 按鈕
-   查看當前 API URL 和生成的 CSP 配置
-   複製配置用於除錯或文件

## 🧪 測試和驗證

### 自動化測試

```bash
npm run security:check
# ✅ 動態 CSP 配置註釋
# ✅ 安全分數: 100%
```

### 手動驗證

1. **API 請求**: 檢查 Network 面板無 `(blocked:csp)` 錯誤
2. **圖片載入**: 確認 Active Storage 圖片正常顯示
3. **CSP 違規**: Console 無 CSP 違規警告

### 不同環境測試

```bash
# 測試不同 API URL
VITE_API_URL=https://test1.com/api/v1/ npm run dev
VITE_API_URL=https://test2.com/api/v1/ npm run dev
```

## 📋 解決的具體問題

### ✅ 問題 1: Railway 部署 API URL 配置

**之前**: 需要手動修改多個 CSP 配置檔案
**現在**: 只需設定 `VITE_API_URL` 環境變數

### ✅ 問題 2: Active Storage 圖片載入

**之前**:

```
img-src 'self' data: https: blob:
# 不包含 API 域名，圖片被阻止
```

**現在**:

```
img-src 'self' data: https: blob: https://api.ridecycle.com
# 自動包含 API 域名，圖片正常載入
```

### ✅ 問題 3: 多環境配置維護

**之前**: 需要為每個環境維護不同的 CSP 配置
**現在**: 單一配置自動適應所有環境

## 🔒 安全性保證

### 不降低安全性

-   只添加必要的 API 域名
-   保持其他 CSP 規則嚴格性
-   支援 HTTPS 強制升級

### 動態配置驗證

-   自動驗證 URL 格式
-   錯誤處理和回退機制
-   開發環境配置檢查

### 監控和除錯

-   CSP 違規即時監控
-   配置變更日誌記錄
-   開發工具支援

## 🚀 未來擴展

### 1. 更多環境變數支援

```bash
VITE_CDN_URL=https://cdn.ridecycle.com
VITE_ANALYTICS_URL=https://analytics.ridecycle.com
```

### 2. 條件式 CSP 規則

```typescript
// 根據功能開關調整 CSP
if (enableAnalytics) {
    cspConfig['script-src'].push('https://analytics.ridecycle.com')
}
```

### 3. CSP 報告分析

-   自動分析 CSP 違規模式
-   建議配置優化
-   安全風險評估

## 📚 相關文件

-   [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 詳細部署指南
-   [SECURITY.md](./SECURITY.md) - 完整安全實作
-   [CSP_FIX.md](./CSP_FIX.md) - CSP 問題修正記錄

## 💡 最佳實踐

1. **環境變數命名**: 使用 `VITE_` 前綴確保建置時可用
2. **URL 格式**: 包含完整協議和路徑 (`https://domain.com/api/v1/`)
3. **測試驗證**: 部署前測試不同 API URL 配置
4. **監控設定**: 啟用 CSP 違規報告監控
5. **文件更新**: 記錄環境特定的配置需求
