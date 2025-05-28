# 🚀 部署指南 - 動態 CSP 配置

## 概述

RideCycle 前端應用使用動態 Content Security Policy (CSP) 配置，會根據 `VITE_API_URL` 環境變數自動調整安全設定。這確保了在不同部署環境中都能正確允許 API 請求和圖片載入。

## 🔧 環境變數配置

### 必需的環境變數

```bash
VITE_API_URL=https://your-api-domain.com/api/v1/
```

### 可選的環境變數

```bash
# 如果需要自定義 CSP 報告端點
VITE_CSP_REPORT_URI=/api/v1/security/csp-violations

# 如果需要啟用 CSP 監控
VITE_ENABLE_CSP_MONITORING=true
```

## 🌐 不同平台部署設定

### 1. Railway

#### 設定步驟：

1. 在 Railway 專案設定中找到 "Variables" 頁籤
2. 添加環境變數：

```bash
VITE_API_URL=https://your-backend-app.railway.app/api/v1/
```

#### 範例配置：

```bash
# 如果您的後端部署在 Railway 上
VITE_API_URL=https://ridecycle-backend-production.railway.app/api/v1/

# 如果使用自定義域名
VITE_API_URL=https://api.ridecycle.com/api/v1/
```

### 2. Vercel

#### 設定步驟：

1. 在 Vercel 專案設定中找到 "Environment Variables"
2. 添加變數：

```bash
Name: VITE_API_URL
Value: https://your-api-domain.com/api/v1/
```

#### vercel.json 配置：

```json
{
    "build": {
        "env": {
            "VITE_API_URL": "https://api.ridecycle.com/api/v1/"
        }
    }
}
```

### 3. Netlify

#### 設定步驟：

1. 在 Netlify 專案設定中找到 "Environment variables"
2. 添加變數：

```bash
VITE_API_URL=https://your-api-domain.com/api/v1/
```

#### netlify.toml 配置：

```toml
[build.environment]
  VITE_API_URL = "https://api.ridecycle.com/api/v1/"
```

### 4. Docker

#### Dockerfile 配置：

```dockerfile
# 建置階段
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# 設定建置時環境變數
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# 生產階段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

#### docker-compose.yml 配置：

```yaml
version: '3.8'
services:
    frontend:
        build:
            context: .
            args:
                VITE_API_URL: https://api.ridecycle.com/api/v1/
        ports:
            - '80:80'
```

### 5. GitHub Actions

#### .github/workflows/deploy.yml 配置：

```yaml
name: Deploy Frontend

on:
    push:
        branches: [main]

jobs:
    deploy:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3

            - name: Setup Node.js
              uses: actions/setup-node@v3
              with:
                  node-version: '18'

            - name: Install dependencies
              run: npm ci

            - name: Build
              env:
                  VITE_API_URL: ${{ secrets.VITE_API_URL }}
              run: npm run build

            - name: Deploy
              # 您的部署步驟
```

## 🔒 動態 CSP 工作原理

### 自動配置

當應用啟動時，動態 CSP 系統會：

1. **讀取環境變數**: 從 `VITE_API_URL` 獲取 API 端點
2. **提取基礎域名**: 從完整 URL 中提取協議和域名
3. **生成 CSP 規則**: 自動添加到 `connect-src` 和 `img-src`
4. **更新 Meta 標籤**: 動態插入或更新 CSP Meta 標籤

### 範例轉換

```bash
# 輸入
VITE_API_URL=https://api.ridecycle.com/api/v1/

# 提取的基礎 URL
https://api.ridecycle.com

# 生成的 CSP 規則
connect-src 'self' https://api.ridecycle.com https://accounts.google.com;
img-src 'self' data: https: blob: https://api.ridecycle.com;
```

## 🧪 測試和驗證

### 開發環境測試

1. 設定環境變數：

```bash
# .env.local
VITE_API_URL=https://your-test-api.com/api/v1/
```

2. 啟動開發伺服器：

```bash
npm run dev
```

3. 檢查動態配置：
    - 點擊左下角的設定按鈕 ⚙️
    - 查看生成的 CSP 配置
    - 確認 API URL 和基礎 URL 正確

### 生產環境驗證

1. 檢查瀏覽器開發者工具：

    - Network 面板確認 API 請求成功
    - Console 面板檢查是否有 CSP 違規

2. 使用安全檢查工具：

```bash
npm run security:check
```

## 🚨 常見問題和解決方案

### 1. API 請求被 CSP 阻止

**症狀**: Network 面板顯示 `(blocked:csp)`

**解決方案**:

-   檢查 `VITE_API_URL` 是否正確設定
-   確認 URL 格式包含協議 (`https://`)
-   重新建置應用

### 2. 圖片無法載入

**症狀**: 圖片顯示為破圖

**解決方案**:

-   確認圖片 URL 的域名與 API 域名一致
-   檢查 `img-src` CSP 規則是否包含正確域名

### 3. 環境變數未生效

**症狀**: 仍然使用預設的 localhost URL

**解決方案**:

-   確認環境變數名稱正確 (`VITE_API_URL`)
-   重新建置應用 (`npm run build`)
-   檢查部署平台的環境變數設定

### 4. CORS 錯誤

**症狀**: API 請求被 CORS 政策阻止

**解決方案**:

-   在後端配置 CORS 允許前端域名
-   確認 API 端點支援 preflight 請求

## 📋 部署檢查清單

### 建置前

-   [ ] 設定正確的 `VITE_API_URL`
-   [ ] 確認 API 端點可訪問
-   [ ] 執行 `npm run security:check`

### 部署後

-   [ ] 測試 API 請求功能
-   [ ] 檢查圖片載入
-   [ ] 驗證 CSP 配置
-   [ ] 測試用戶認證流程

### 監控

-   [ ] 設定 CSP 違規監控
-   [ ] 配置錯誤警報
-   [ ] 定期檢查安全日誌

## 🔗 相關文件

-   [SECURITY.md](./SECURITY.md) - 完整安全實作指南
-   [PRODUCTION_SECURITY.md](./PRODUCTION_SECURITY.md) - 生產環境安全配置
-   [CSP_FIX.md](./CSP_FIX.md) - CSP 問題修正記錄

## 💡 最佳實踐

1. **使用 HTTPS**: 生產環境務必使用 HTTPS
2. **域名一致性**: 確保前後端使用相同的域名策略
3. **環境隔離**: 不同環境使用不同的 API 端點
4. **定期更新**: 定期檢查和更新安全配置
5. **監控違規**: 設定 CSP 違規報告監控
