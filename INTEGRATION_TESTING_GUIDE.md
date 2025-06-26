# 整合測試指南

本指南介紹如何在 RideCycle 專案中執行整合測試，涵蓋後端 API、前端組件和端到端測試。

## 🏗️ 測試架構概覽

### 三層測試策略

1. **後端 API 整合測試** (Rails Request Specs)
2. **前端組件整合測試** (React Testing Library + Vitest)
3. **端到端測試** (Playwright)

## 🔧 環境設定

### 後端測試環境

```bash
cd backend

# 安裝依賴
bundle install

# 設置測試資料庫
RAILS_ENV=test rails db:setup
RAILS_ENV=test rails db:migrate

# 執行測試
bundle exec rspec
```

### 前端測試環境

```bash
cd frontend

# 安裝依賴
npm install

# 安裝 Playwright（僅用於 E2E 測試）
npx playwright install

# 執行單元和整合測試
npm run test

# 執行 E2E 測試
npx playwright test
```

## 📋 測試分類

### 1. 後端 API 整合測試

**檔案位置**: `backend/spec/integration/`

**測試範圍**:

-   完整的使用者註冊到購買流程
-   防止自己對自己出價
-   多用戶出價競爭
-   API 錯誤處理

**執行方式**:

```bash
cd backend
bundle exec rspec spec/integration/
```

**主要測試檔案**:

-   `spec/integration/user_workflow_spec.rb` - 完整使用者流程測試

### 2. 前端組件整合測試

**檔案位置**: `frontend/src/test/integration/`

**測試範圍**:

-   用戶登入流程
-   腳踏車瀏覽和詳情查看
-   出價表單操作
-   錯誤處理和表單驗證

**執行方式**:

```bash
cd frontend
npm run test:integration
```

**主要測試檔案**:

-   `src/test/integration/userWorkflow.test.tsx` - 前端使用者流程測試

### 3. 端到端測試 (E2E)

**檔案位置**: `frontend/src/e2e/`

**測試範圍**:

-   跨瀏覽器完整流程
-   多用戶同時操作
-   真實用戶互動模擬

**執行方式**:

```bash
cd frontend
npx playwright test
```

**主要測試檔案**:

-   `src/e2e/userWorkflow.spec.ts` - 端到端使用者流程測試

## 🚀 測試場景詳解

### 場景 1: 完整購買流程

**測試步驟**:

1. 用戶註冊
2. 用戶登入
3. 瀏覽腳踏車列表
4. 查看商品詳情
5. 發送出價
6. 賣家接受出價
7. 驗證交易完成

**涵蓋的測試層級**:

-   ✅ 後端 API 測試
-   ✅ 前端組件測試
-   ✅ 端到端測試

### 場景 2: 防止自己對自己出價

**測試步驟**:

1. 用戶上架商品
2. 嘗試對自己的商品出價
3. 驗證系統阻止此操作
4. 檢查 UI 顯示正確訊息

**涵蓋的測試層級**:

-   ✅ 後端 API 測試
-   ✅ 前端組件測試
-   ✅ 端到端測試

### 場景 3: 多用戶出價競爭

**測試步驟**:

1. 賣家上架商品
2. 多個買家同時出價
3. 賣家選擇接受其中一個出價
4. 驗證只有一個出價被接受

**涵蓋的測試層級**:

-   ✅ 後端 API 測試
-   ✅ 端到端測試

## 🛠️ 測試工具和框架

### 後端

-   **RSpec**: Ruby 測試框架
-   **FactoryBot**: 測試資料建立
-   **Database Cleaner**: 資料庫清理
-   **WebMock**: HTTP 請求模擬

### 前端

-   **Vitest**: 測試執行器
-   **React Testing Library**: 組件測試
-   **Jest DOM**: DOM 斷言擴展
-   **MSW**: API 模擬 (如果需要)

### 端到端

-   **Playwright**: 瀏覽器自動化
-   **多瀏覽器支援**: Chrome, Firefox, Safari
-   **移動裝置測試**: iOS, Android 模擬

## 📊 測試報告

### 產生測試覆蓋率報告

**後端**:

```bash
cd backend
bundle exec rspec --format documentation --format html --out spec/reports/rspec.html
```

**前端**:

```bash
cd frontend
npm run test:coverage
```

**E2E**:

```bash
cd frontend
npx playwright test --reporter=html
```

## 🎯 最佳實踐

### 測試撰寫原則

1. **AAA 模式**: Arrange, Act, Assert
2. **獨立性**: 每個測試都應該獨立運行
3. **可讀性**: 測試名稱應該清楚描述測試內容
4. **資料清理**: 每次測試後清理測試資料

### 整合測試建議

1. **由外而內**: 先寫 E2E 測試，再細化單元測試
2. **關鍵路徑優先**: 專注於核心業務流程
3. **錯誤場景**: 不要忽略錯誤處理測試
4. **效能考量**: 整合測試通常較慢，合理控制數量

## 🚦 CI/CD 整合

### GitHub Actions 配置範例

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
    backend-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2
            - name: Setup Ruby
              uses: ruby/setup-ruby@v1
              with:
                  ruby-version: 3.1
            - name: Run backend tests
              run: |
                  cd backend
                  bundle install
                  RAILS_ENV=test rails db:setup
                  bundle exec rspec

    frontend-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2
            - name: Setup Node.js
              uses: actions/setup-node@v2
              with:
                  node-version: '18'
            - name: Run frontend tests
              run: |
                  cd frontend
                  npm ci
                  npm run test

    e2e-tests:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2
            - name: Setup Node.js
              uses: actions/setup-node@v2
              with:
                  node-version: '18'
            - name: Install Playwright
              run: npx playwright install
            - name: Run E2E tests
              run: |
                  cd frontend
                  npm ci
                  npx playwright test
```

## 🔍 除錯技巧

### 後端測試除錯

```bash
# 執行特定測試檔案
bundle exec rspec spec/integration/user_workflow_spec.rb

# 只執行特定測試
bundle exec rspec spec/integration/user_workflow_spec.rb:10

# 顯示詳細輸出
bundle exec rspec --format documentation
```

### 前端測試除錯

```bash
# 執行特定測試檔案
npm run test -- userWorkflow.test.tsx

# 監聽模式
npm run test -- --watch

# 顯示測試覆蓋率
npm run test:coverage
```

### E2E 測試除錯

```bash
# 有頭模式執行（可以看到瀏覽器）
npx playwright test --headed

# 單一測試檔案
npx playwright test userWorkflow.spec.ts

# 產生測試報告
npx playwright show-report
```

## 📚 延伸閱讀

-   [RSpec 官方文檔](https://rspec.info/)
-   [React Testing Library 文檔](https://testing-library.com/docs/react-testing-library/intro/)
-   [Playwright 文檔](https://playwright.dev/)
-   [Vitest 文檔](https://vitest.dev/)

## 🤝 貢獻指南

在新增功能時，請確保：

1. 為新功能添加適當的測試
2. 執行所有測試確保沒有回歸
3. 更新相關文檔
4. 遵循專案的測試規範

---

**注意**: 根據實際 API 和 UI 實現，可能需要調整測試選擇器和斷言。此指南提供了一個完整的測試框架基礎。
