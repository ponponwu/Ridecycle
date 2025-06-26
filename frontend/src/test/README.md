# 訂單功能測試

本目錄包含了完整的訂單和結帳流程測試，涵蓋單元測試、組件測試和整合測試。

## 測試結構

```
src/
├── components/checkout/__tests__/
│   ├── DeliveryOptionsForm.test.tsx    # 配送選擇組件測試
│   ├── PaymentForm.test.tsx            # 付款表單組件測試
│   ├── CheckoutConfirmation.test.tsx   # 訂單確認組件測試
│   └── OrderSummary.test.tsx          # 訂單摘要組件測試
├── utils/__tests__/
│   ├── orderCalculations.test.ts       # 訂單計算工具測試
│   └── priceFormatter.test.ts          # 價格格式化工具測試
└── test/integration/
    └── checkout.integration.test.tsx    # 完整結帳流程整合測試
```

## 測試覆蓋範圍

### 🧩 組件測試

#### DeliveryOptionsForm

-   ✅ 渲染配送選項（宅配/面交）
-   ✅ 根據地區計算運費
-   ✅ 顯示面交付款流程說明
-   ✅ 處理選項變更事件
-   ✅ 顯示正確的價格和預估時間

#### PaymentForm

-   ✅ 顯示銀行帳戶資訊
-   ✅ 複製銀行資訊到剪貼簿
-   ✅ 表單驗證（必填欄位、格式驗證）
-   ✅ 文件上傳功能
-   ✅ 僅允許數字輸入帳戶後五碼
-   ✅ 顯示安全提醒和注意事項

#### CheckoutConfirmation

-   ✅ 顯示完整訂單資訊
-   ✅ 根據配送方式顯示不同資訊
-   ✅ 條款同意功能
-   ✅ 價格計算正確性

#### OrderSummary

-   ✅ 顯示商品詳情
-   ✅ 根據配送方式顯示不同資訊
-   ✅ 價格明細計算
-   ✅ 賣家資訊顯示

### 🔧 工具函數測試

#### orderCalculations

-   ✅ 價格計算（小計、運費、稅金、總計）
-   ✅ 不同地區運費計算
-   ✅ 重量加價計算
-   ✅ 預估到貨時間
-   ✅ 訂單編號生成
-   ✅ 訂單資料驗證

### 🔄 整合測試

#### 完整結帳流程

-   ✅ 宅配訂單完整流程（4 步驟）
-   ✅ 面交訂單完整流程（含特殊說明）
-   ✅ 表單驗證和錯誤處理
-   ✅ 步驟間導航（前進/後退）
-   ✅ 資料保持（返回時不丟失）
-   ✅ 不同地區和重量的價格計算

## 執行測試

### 執行全部測試

```bash
npm test
```

### 執行特定測試檔案

```bash
# 組件測試
npm test DeliveryOptionsForm.test.tsx
npm test PaymentForm.test.tsx

# 工具函數測試
npm test orderCalculations.test.ts

# 整合測試
npm test checkout.integration.test.tsx
```

### 執行測試並產生覆蓋率報告

```bash
npm run test:coverage
```

### 監視模式（開發時使用）

```bash
npm run test:watch
```

## 測試情境

### 📦 宅配流程測試

1. **基本宅配流程**

    - 填寫配送地址
    - 選擇宅配方式
    - 填寫銀行轉帳資訊
    - 確認訂單並下單

2. **偏遠地區宅配**

    - 測試離島地區（澎湖、金門等）
    - 驗證額外運費計算
    - 確認較長配送時間

3. **重物宅配**
    - 測試超過 10kg 的自行車
    - 驗證重量加價計算

### 🤝 面交流程測試

1. **基本面交流程**

    - 填寫聯絡資訊
    - 選擇面交方式
    - 查看面交付款流程說明
    - 確認免運費訂單

2. **面交特殊功能**
    - 7 天託管付款說明
    - 退貨政策提醒
    - 安全交易警告

### 🔍 驗證和錯誤處理

1. **表單驗證**

    - 必填欄位檢查
    - 電話號碼格式驗證
    - 銀行帳戶後五碼格式檢查

2. **用戶體驗**
    - 步驟間資料保持
    - 返回按鈕功能
    - 載入狀態處理
    - 銀行帳戶後五碼格式檢查

## Mock 設定

測試使用以下 Mock：

### 📍 路由 Mock

```

```
