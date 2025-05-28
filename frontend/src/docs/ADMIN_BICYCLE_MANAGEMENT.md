# 🚴‍♂️ 管理員自行車管理功能

## 📋 功能概述

管理員自行車管理功能允許管理員審核、管理和監控平台上的所有自行車列表。

## 🔧 已實作功能

### 1. 自行車列表管理

-   ✅ 按狀態分類顯示（待審核、已審核、已拒絕）
-   ✅ 搜尋和篩選功能
-   ✅ 分頁支援
-   ✅ 賣家資訊顯示

### 2. 自行車詳細資訊

-   ✅ 完整的自行車資訊顯示
-   ✅ 賣家詳細資料
-   ✅ 圖片畫廊
-   ✅ 狀態徽章

### 3. 審核操作

-   ✅ 審核通過功能
-   ✅ 拒絕功能（含原因）
-   ✅ 確認對話框
-   ✅ 載入狀態指示

### 4. 國際化支援

-   ✅ 完整的繁體中文翻譯
-   ✅ 動態語言切換

## 🎯 使用方式

### 訪問管理員面板

1. 以管理員身份登入
2. 導航至 `/admin/bicycles`
3. 選擇要查看的狀態分頁

### 審核自行車

1. 在「待審核」分頁中查看待審核的自行車
2. 點擊「查看詳情」查看完整資訊
3. 使用「審核通過」或「拒絕」按鈕進行操作
4. 拒絕時可選擇性提供原因

### 管理已審核的自行車

1. 在「已審核」分頁查看已通過的自行車
2. 在「已拒絕」分頁查看被拒絕的自行車
3. 可重新審核或修改狀態

## 🔄 API 端點

### 獲取自行車列表

```
GET /api/v1/admin/bicycles?status=pending&page=1&limit=20
```

### 獲取單一自行車詳情

```
GET /api/v1/admin/bicycles/:id
```

### 審核通過

```
PATCH /api/v1/admin/bicycles/:id/approve
```

### 拒絕自行車

```
PATCH /api/v1/admin/bicycles/:id/reject
Body: { reason: "拒絕原因" }
```

## 📊 資料結構

### 自行車資料

```typescript
interface BicycleWithOwner extends IBicycle {
    user_id: number
    seller?: IBicycleUser
    seller_info?: {
        id: number
        name: string
        full_name: string
        email: string
    }
}
```

### 賣家資料

```typescript
interface IBicycleUser {
    id: number
    name: string
    full_name?: string
    email?: string
    avatar_url?: string
}
```

### 🔄 資料存取優先順序

前端組件使用以下優先順序來獲取賣家資料：

1. `bicycle.seller` - 主要的語義化關聯
2. `bicycle.seller_info` - 序列化器提供的備援資料
3. `bicycle.user` - 原始的用戶關聯（向後兼容）

## 🎨 UI 組件

### 主要組件

-   `BicycleManagement`: 主管理頁面
-   `BicycleTable`: 自行車列表表格
-   `BicycleDetailsView`: 詳細資訊頁面
-   `AdminActions`: 管理員操作按鈕
-   `SellerCard`: 賣家資訊卡片
-   `BicycleInformation`: 自行車資訊顯示

### 工具組件

-   `useStatusBadge`: 狀態徽章 hook
-   `useBicycleManagement`: 列表管理 hook
-   `useBicycleDetails`: 詳情管理 hook

## 🔒 權限控制

### 後端權限

-   所有管理員 API 都需要 `authenticate_user!`
-   使用 `ensure_admin!` 確保只有管理員可以訪問

### 前端權限

-   路由保護確保只有管理員可以訪問
-   UI 組件根據用戶角色顯示

## 🚀 效能優化

### 後端優化

-   使用 `includes` 預載入關聯資料，避免 N+1 查詢
-   分頁支援減少資料傳輸
-   索引優化查詢效能

### 前端優化

-   使用 React.memo 優化組件渲染
-   懶載入圖片
-   狀態管理優化

## 🐛 故障排除

### 常見問題

#### 1. 賣家資料顯示為「未知用戶」

**原因**: 後端序列化器未正確包含用戶關聯
**解決方案**: 檢查 `BicycleSerializer` 中的 `belongs_to :user` 關聯

#### 2. 審核操作無效果

**原因**: API 請求失敗或權限不足
**解決方案**:

-   檢查網路請求
-   確認用戶具有管理員權限
-   查看瀏覽器控制台錯誤

#### 3. 翻譯缺失

**原因**: i18n 鍵值未定義
**解決方案**: 在 `frontend/src/locales/zh.ts` 中添加缺失的翻譯

### 除錯工具

-   瀏覽器開發者工具
-   網路面板查看 API 請求
-   控制台查看錯誤訊息

## 📈 未來改進

### 計劃功能

-   [ ] 批量操作（批量審核/拒絕）
-   [ ] 審核歷史記錄
-   [ ] 自動審核規則
-   [ ] 統計報表
-   [ ] 匯出功能

### 效能改進

-   [ ] 虛擬滾動支援大量資料
-   [ ] 更好的快取策略
-   [ ] 即時通知

## 🔧 開發指南

### 添加新的管理員功能

1. 在後端創建相應的控制器和路由
2. 更新序列化器
3. 在前端創建服務方法
4. 實作 UI 組件
5. 添加翻譯
6. 編寫測試

### 修改現有功能

1. 更新後端 API
2. 修改前端服務
3. 更新 UI 組件
4. 測試功能
5. 更新文件

## 📝 測試

### 手動測試清單

-   [ ] 管理員可以查看所有狀態的自行車
-   [ ] 審核通過功能正常
-   [ ] 拒絕功能正常（含原因）
-   [ ] 賣家資訊正確顯示
-   [ ] 分頁功能正常
-   [ ] 搜尋功能正常
-   [ ] 翻譯完整且正確

### 自動化測試

-   後端: RSpec 測試覆蓋所有 API 端點
-   前端: Jest + Testing Library 測試組件

## 📞 支援

如有問題或需要協助，請：

1. 查看此文件的故障排除部分
2. 檢查相關的程式碼註釋
3. 查看測試案例了解預期行為
