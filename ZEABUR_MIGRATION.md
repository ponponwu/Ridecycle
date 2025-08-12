# Zeabur 遷移指南

## 概述

本指南將協助您將 RideCycle 專案從 Railway 遷移到 Zeabur 平台，實現更安全的內部服務通訊架構。

## 架構變更

### Railway (原始架構)
```
Internet → Frontend (Public) → Backend API (Public) → Database
```

### Zeabur (新架構)
```
Internet → Frontend (Public) → Nginx Proxy → Backend (Internal) → Database (Internal)
```

## 檔案說明

### 新增檔案
- `nginx-zeabur.conf` - Zeabur 專用的 Nginx 配置 (基礎版)
- `nginx-zeabur-enhanced.conf` - Zeabur 增強版 Nginx 配置 (進階版)
- `Dockerfile.zeabur` - Zeabur 專用的前端 Dockerfile
- `zeabur.yaml` - Zeabur 服務配置檔案
- `ZEABUR_MIGRATION.md` - 本遷移指南

### Nginx 配置版本說明

#### 基礎版 (`nginx-zeabur.conf`)
- **適用對象**: 初次遷移、快速部署
- **特色**: 核心功能、穩定可靠
- **包含**: API 代理、基本安全標頭、SPA 路由支援

#### 增強版 (`nginx-zeabur-enhanced.conf`)
- **適用對象**: 生產環境、高安全需求
- **特色**: 全面安全防護、效能優化
- **包含**: 
  - 增強 CSP 政策
  - Cross-Origin 安全標頭
  - 錯誤頁面處理
  - 健康檢查端點
  - 更嚴格的檔案類型處理

### 主要變更

#### 1. Nginx 配置變更 (`nginx-zeabur.conf`)
- **移除外部 API 域名依賴**：不再需要 `https://api.ridecycle.com`
- **新增 API 代理**：`/api/*` 請求轉發到內部 `backend:3000`
- **簡化 CSP 設定**：`connect-src 'self'`
- **支援 WebSocket**：為未來功能預留

#### 2. 前端環境變數變更
```bash
# Railway (舊設定)
VITE_API_URL=https://api.ridecycle.com

# Zeabur (新設定)
VITE_API_URL=/api
```

#### 3. 服務配置 (`zeabur.yaml`)
- **Frontend**: 公開訪問，包含 nginx 代理
- **Backend**: 內部服務，不對外暴露
- **Database**: 內部服務，僅後端可訪問

## 遷移步驟

### 第一階段：準備工作

1. **備份現有配置**
   ```bash
   # 備份當前 Railway 設定
   cp nginx.conf nginx-railway.conf.backup
   cp Dockerfile Dockerfile.railway.backup
   ```

2. **驗證檔案結構**
   ```
   ride-cycle/
   ├── frontend/
   │   ├── nginx-zeabur.conf    # 新增
   │   ├── Dockerfile.zeabur    # 新增
   │   └── ...
   ├── backend/
   │   └── ...
   ├── zeabur.yaml             # 新增
   └── ZEABUR_MIGRATION.md     # 新增
   ```

### 第二階段：環境變數配置

#### Zeabur 平台設定

1. **前端服務環境變數**
   ```bash
   NODE_ENV=production
   VITE_API_URL=/api
   ```

2. **後端服務環境變數**
   ```bash
   RAILS_ENV=production
   DATABASE_URL=postgresql://database:5432/ridecycle_production
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=ap-northeast-1
   AWS_S3_BUCKET=your_bucket_name
   SECRET_KEY_BASE=your_secret_key
   RAILS_MASTER_KEY=your_rails_master_key
   ```

3. **資料庫環境變數**
   ```bash
   POSTGRES_DB=ridecycle_production
   POSTGRES_USER=ridecycle_user
   POSTGRES_PASSWORD=secure_password
   ```

### 第三階段：部署設定

#### 1. 建立 Zeabur 專案
```bash
# 安裝 Zeabur CLI
npm install -g @zeabur/cli

# 登入 Zeabur
zeabur auth login

# 建立新專案
zeabur project create ride-cycle
```

#### 2. 部署服務
```bash
# 部署整個專案
zeabur deploy

# 或分別部署服務
zeabur service deploy frontend
zeabur service deploy backend
```

#### 3. 設定域名
```bash
# 設定前端域名
zeabur domain add frontend your-domain.com
```

### 第四階段：測試驗證

#### 1. 功能測試
- [ ] 前端頁面正常載入
- [ ] API 呼叫正常運作（透過 `/api/*` 代理）
- [ ] 使用者登入/註冊功能
- [ ] 圖片上傳功能
- [ ] 所有 CRUD 操作

#### 2. 安全測試
- [ ] 後端無法直接從外部訪問
- [ ] CSP 標頭正確設定
- [ ] HTTPS 強制重導向
- [ ] API 代理正常運作

#### 3. 效能測試
- [ ] 頁面載入速度
- [ ] API 回應時間
- [ ] 圖片載入效能
- [ ] 內部網路通訊延遲

## Grok AI 建議分析

### Grok 建議的優點 ✅
1. **HTTPS 重定向**: 強制安全連線（生產環境標準）
2. **增強安全標頭**: 更詳細的 CSP 和權限政策
3. **效能優化**: access_log off、更多 gzip 類型
4. **速率限制**: 防止 DDoS 攻擊

### Grok 建議的問題 ❌
1. **SSL 憑證配置**: Zeabur 自動管理，手動配置會失敗
2. **internal 指令誤用**: 會阻止所有外部 API 請求
3. **語法結構錯誤**: server 區塊嵌套問題
4. **服務名稱錯誤**: 使用 'rails' 而非 'backend'
5. **limit_req_zone 位置**: 應在 http 區塊，非 server 區塊

### 我們的修正方案 ✅
- **保留有用改進**: 安全標頭、效能優化
- **修正所有問題**: 移除不相容配置
- **Zeabur 優化**: 專為平台特性設計
- **提供兩版本**: 基礎版 + 增強版選擇

## 故障排除

### 常見問題

#### 1. API 呼叫失敗
**問題**: 前端無法連接到後端 API
**解決方案**:
- 檢查 `nginx-zeabur.conf` 中的 `proxy_pass` 設定
- 確認後端服務名稱為 `backend`
- 驗證 Zeabur 內部網路配置

#### 2. 靜態檔案載入失敗
**問題**: CSS/JS 檔案無法載入
**解決方案**:
- 檢查 nginx 靜態檔案配置
- 確認建置產出目錄路徑正確
- 驗證 Dockerfile 複製步驟

#### 3. 資料庫連線失敗
**問題**: 後端無法連接資料庫
**解決方案**:
- 檢查 `DATABASE_URL` 環境變數
- 確認資料庫服務名稱為 `database`
- 驗證 PostgreSQL 容器狀態

### 日誌檢查
```bash
# 檢查服務日誌
zeabur logs frontend
zeabur logs backend
zeabur logs database

# 即時日誌監控
zeabur logs frontend --follow
```

## 回滾計劃

如需回滾到 Railway：
1. 重新啟用 Railway 服務
2. 復原原始 `nginx.conf` 和 `Dockerfile`
3. 恢復外部 API URL 設定
4. 更新 DNS 記錄指向 Railway

## 效能對比

### 預期改善
- **安全性**: 後端不對外暴露 ✅
- **成本**: 減少公開端點費用 ✅
- **延遲**: 內部網路通訊更快 ✅
- **維護**: 簡化的網路架構 ✅

### 監控指標
- API 回應時間
- 內部網路延遲
- 記憶體使用量
- CPU 使用率

## 支援資源

- [Zeabur 官方文件](https://zeabur.com/docs)
- [Nginx 代理配置](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Docker 多階段建置](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/)

---

**注意**: 請在遷移前充分測試所有功能，並確保備份重要資料。