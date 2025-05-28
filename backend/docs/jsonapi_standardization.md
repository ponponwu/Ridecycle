# JSON:API 標準化文件

## 概述

本專案已完成 JSON:API 格式的統一化，確保前後端 API 回應格式的一致性。

## 後端統一化

### 1. JsonApiResponse Concern

創建了 `app/controllers/concerns/json_api_response.rb` 提供統一的回應方法：

-   `render_jsonapi_resource(resource, serializer:, options:, status:)` - 單一資源回應
-   `render_jsonapi_collection(collection, serializer:, meta:, options:, status:)` - 集合回應
-   `render_jsonapi_errors(errors, status:, title:)` - 錯誤回應
-   `render_jsonapi_success(message:, meta:, status:)` - 成功回應
-   `render_jsonapi_custom(type:, id:, attributes:, meta:, status:)` - 自定義回應

### 2. 控制器更新

所有控制器已更新使用統一的回應方法：

#### 管理員控制器 (`Api::V1::Admin::BicyclesController`)

-   `index` - 使用 `render_jsonapi_collection`
-   `show` - 使用 `render_jsonapi_resource`
-   `approve/reject` - 使用 `render_jsonapi_custom`
-   `update` - 使用 `render_jsonapi_resource`
-   `destroy` - 標準 204 回應
-   錯誤處理 - 使用 `render_jsonapi_errors`

#### 一般自行車控制器 (`Api::V1::BicyclesController`)

-   `index` - 使用 `render_jsonapi_collection`
-   `show` - 使用 `render_jsonapi_resource`
-   `create` - 使用 `render_jsonapi_resource`
-   `update` - 使用 `render_jsonapi_resource`
-   `destroy` - 標準 204 回應
-   `me` - 使用 `render_jsonapi_collection`
-   `featured` - 使用 `render_jsonapi_collection`
-   `recently_added` - 使用 `render_jsonapi_collection`

#### 認證控制器 (`Api::V1::AuthController`)

-   `register` - 使用 `render_jsonapi_resource`
-   `login` - 使用 `render_jsonapi_resource`
-   `me` - 使用 `render_jsonapi_resource`

#### 其他控制器

-   `BrandsController` - 統一使用 JSON:API 方法
-   `BicycleModelsController` - 統一使用 JSON:API 方法

### 3. 標準回應格式

#### 單一資源

```json
{
  "data": {
    "id": "1",
    "type": "bicycle",
    "attributes": {
      "title": "...",
      "price": 1000,
      ...
    },
    "relationships": {
      "brand": {
        "data": { "id": "1", "type": "brand" }
      }
    }
  }
}
```

#### 集合資源

```json
{
  "data": [
    {
      "id": "1",
      "type": "bicycle",
      "attributes": { ... },
      "relationships": { ... }
    }
  ],
  "meta": {
    "total_count": 100,
    "current_page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

#### 錯誤回應

```json
{
    "errors": [
        {
            "id": "1",
            "status": "422",
            "title": "Unprocessable Entity",
            "detail": "Title can't be blank"
        }
    ]
}
```

## 前端統一化

### 1. API 客戶端處理

`frontend/src/api/client.ts` 中的 `processJSONAPIResponse` 函數自動處理 JSON:API 格式：

-   自動提取 `attributes` 到頂層
-   保留 `id` 欄位
-   處理集合和單一資源
-   保留 `meta` 和 `links` 資訊

### 2. 服務層簡化

`frontend/src/services/admin.service.ts` 已簡化，直接使用 API 客戶端處理後的結果：

```typescript
const response = await apiClient.get(`${this.baseUrl}/bicycles?${queryParams.toString()}`)
const bicycles = Array.isArray(response.data) ? (response.data as BicycleWithOwner[]) : []
const meta = response.meta || {}
```

### 3. 型別定義

新增 `BicycleWithOwner` 型別以支援管理員視圖的需求。

## 優點

1. **一致性** - 所有 API 端點使用相同的回應格式
2. **可維護性** - 統一的錯誤處理和回應格式
3. **可擴展性** - 新的端點可以輕鬆使用現有的回應方法
4. **標準化** - 遵循 JSON:API 規範
5. **型別安全** - 前端有完整的型別定義

## 測試驗證

已通過以下測試：

-   TypeScript 編譯檢查
-   Ruby 語法檢查
-   JSON:API 格式一致性測試
-   前端型別檢查

## 注意事項

1. 所有新的 API 端點都應該使用 `JsonApiResponse` concern 中的方法
2. 前端服務應該依賴 API 客戶端的自動處理，而不是手動解析 JSON:API 格式
3. 錯誤處理應該使用 `render_jsonapi_errors` 方法以保持一致性
