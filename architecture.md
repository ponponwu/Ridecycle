# 二手腳踏車交易平台架構

## 目錄

1. [系統概述](#系統概述)
2. [技術堆疊](#技術堆疊)
3. [資料庫設計](#資料庫設計)
4. [後端架構 (Rails API)](#後端架構-rails-api)
5. [前端架構 (React.js)](#前端架構-reactjs)
6. [認證與授權機制](#認證與授權機制)
7. [服務連接與狀態管理](#服務連接與狀態管理)
8. [部署架構](#部署架構)
9. [安全考量](#安全考量)

## 系統概述

這個二手腳踏車交易平台 (Pedal Palace) 旨在提供一個專業、便捷、透明且具社群性的環境，讓用戶可以安心地買賣二手腳踏車。核心價值主張包括：

-   **專業**：提供標準化的腳踏車品牌與型號資料庫，詳細的規格資訊
-   **便捷**：簡化二手腳踏車的上架、搜尋和交易流程
-   **透明**：提供詳細的車況描述、照片和評價系統
-   **社群**：內建即時通訊系統，連接具有共同興趣的車友

## 技術堆疊

### 前端

-   **框架**：React.js、React Router
-   **狀態管理**：React Context API
-   **樣式**：Tailwind CSS、Shadcn UI 組件
-   **API 通訊**：Axios、自定義 API client
-   **表單處理**：React Hook Form
-   **多語言**：i18next

### 後端

-   **框架**：Ruby on Rails (API 模式)
-   **資料庫**：PostgreSQL
-   **檔案儲存**：Active Storage、Amazon S3 (可選)
-   **序列化**：JSONAPI::Serializer
-   **身份驗證**：JWT 雙令牌機制 (access token + refresh token)
-   **社交登入**：OmniAuth (Google、Facebook 整合)
-   **安全**：CSRF 保護、HttpOnly/同源安全 Cookies

## 資料庫設計

```
┌─────────────┐     ┌───────────────┐     ┌─────────────┐
│    users    │     │    bicycles   │     │  messages   │
├─────────────┤     ├───────────────┤     ├─────────────┤
│ id          │     │ id            │     │ id          │
│ email       │     │ user_id       │──┐  │ sender_id   │
│ password    │     │ title         │  │  │ recipient_id│
│ name        │ ┌───│ price         │  │  │ content     │
│ provider    │ │   │ brand         │  │  │ bicycle_id  │
│ uid         │ │   │ model         │  │  │ is_read     │
│ created_at  │ │   │ year          │  │  │ created_at  │
│ updated_at  │ │   │ bicycletype     │  │  └─────────────┘
└─────────────┘ │   │ frame_size    │  │         ▲
      │         │   │ description   │  │         │
      │         │   │ condition     │  │         │
┌─────▼─────────┴┐  │ location      │  │   ┌─────┴───────┐
│  refresh_tokens│  │ contact_method│  │   │  orders     │
├────────────────┤  │ status        │  │   ├─────────────┤
│ id             │  │ specifications│  │   │ id          │
│ user_id        │  │ created_at    │  │   │ order_number│
│ token          │  │ updated_at    │  │   │ user_id     │
│ expires_at     │  └───────────────┘  │   │ bicycle_id  │
│ revoked_at     │          │         │   │ total_price │
│ created_at     │          │         │   │ status      │
└────────────────┘          ▼         │   │ payment_data│
                   ┌────────────────┐ │   │ shipping_add│
                   │ active_storage │ │   │ created_at  │
                   │ attachments    │◄┘   │ updated_at  │
                   │ (photos)       │     └─────────────┘
                   └────────────────┘
```

### 主要模型說明

1. **User**：平台用戶

    - 支援本地帳密登入或社交媒體登入 (OAuth)
    - 一個用戶可發布多個腳踏車、創建多個訂單
    - 關聯 `refresh_tokens` 實現安全的令牌刷新

2. **Bicycle**：腳踏車商品

    - 核心商品模型，包含基本規格與價格資訊
    - 通過 Active Storage 管理多張商品圖片
    - `specifications` 欄位使用 JSON 結構存儲特定規格

3. **Message**：用戶間通訊

    - 實現買家與賣家之間的通訊
    - 每則訊息關聯特定腳踏車，便於追蹤討論對象

4. **Order**：交易訂單

    - 記錄購買交易資訊
    - 包含支付詳情、出貨地址等資訊
    - 透過狀態欄位追蹤訂單進度

5. **RefreshToken**：刷新令牌
    - 儲存用於安全身份驗證的刷新令牌
    - 實現令牌撤銷、過期管理
    - 一個用戶可持有多個令牌

## 後端架構 (Rails API)

### 資料夾結構

```
backend/
├── app/
│   ├── controllers/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth_controller.rb        # 用戶認證
│   │   │   │   ├── bicycles_controller.rb    # 腳踏車管理
│   │   │   │   ├── messages_controller.rb    # 訊息管理
│   │   │   │   ├── orders_controller.rb      # 訂單管理
│   │   │   │   ├── refresh_controller.rb     # 令牌刷新
│   │   │   │   └── sessions_controller.rb    # 社交登入
│   │   │   └── application_controller.rb     # 共用控制器邏輯
│   ├── models/
│   │   ├── bicycle.rb                        # 腳踏車模型
│   │   ├── bicycle_image.rb                  # 腳踏車圖片
│   │   ├── message.rb                        # 訊息模型
│   │   ├── order.rb                          # 訂單模型
│   │   ├── refresh_token.rb                  # 刷新令牌模型
│   │   └── user.rb                           # 用戶模型
│   ├── serializers/
│   │   ├── bicycle_serializer.rb             # 腳踏車序列化
│   │   ├── message_serializer.rb             # 訊息序列化
│   │   ├── order_serializer.rb               # 訂單序列化
│   │   └── user_serializer.rb                # 用戶序列化
│   ├── services/
│   │   └── image_upload_service.rb           # 圖片上傳服務
│   └── channels/
│       └── application_cable/                # WebSocket基礎設施
├── config/
│   ├── routes.rb                             # 路由定義
│   └── initializers/                         # 系統初始化
└── db/
    └── migrate/                              # 資料庫遷移
```

### 主要控制器功能

1. **AuthController**：處理用戶認證

    - 註冊、登入、登出
    - CSRF 令牌生成與驗證

2. **BicyclesController**：腳踏車管理

    - 上架、搜尋、檢視、更新、刪除腳踏車
    - 圖片上傳與處理

3. **MessagesController**：訊息管理

    - 發送訊息
    - 檢視對話歷史
    - 標記已讀/未讀

4. **OrdersController**：訂單管理

    - 建立訂單
    - 檢視訂單歷史
    - 更新訂單狀態

5. **RefreshController**：令牌刷新

    - 刷新過期的 Access Token
    - 撤銷令牌

6. **SessionsController**：社交登入
    - 處理 OmniAuth 回調
    - 第三方身份驗證整合

## 前端架構 (React.js)

### 資料夾結構

```
frontend/
├── public/
│   └── assets/                    # 靜態資源
├── src/
│   ├── api/
│   │   ├── client.js              # API客戶端
│   │   └── services/              # API服務
│   │       ├── auth.service.js    # 認證相關API
│   │       ├── bicycle.service.js # 腳踏車相關API
│   │       └── message.service.js # 訊息相關API
│   ├── components/
│   │   ├── auth/                  # 認證相關組件
│   │   ├── bicycle/               # 腳踏車相關組件
│   │   ├── bicycles/              # 腳踏車列表組件
│   │   ├── checkout/              # 結帳相關組件
│   │   ├── home/                  # 首頁相關組件
│   │   ├── layout/                # 布局組件
│   │   ├── messages/              # 訊息相關組件
│   │   ├── profile/               # 用戶檔案組件
│   │   ├── search/                # 搜尋相關組件
│   │   ├── sell/                  # 上架相關組件
│   │   └── ui/                    # UI基礎組件
│   ├── contexts/
│   │   ├── AuthContext.tsx        # 認證上下文
│   │   ├── CartContext.tsx        # 購物車上下文
│   │   └── SearchContext.tsx      # 搜尋上下文
│   ├── hooks/
│   │   ├── use-toast.ts           # Toast通知鉤子
│   │   └── useSellBikeForm.ts     # 上架表單鉤子
│   ├── locales/                   # 多語言配置
│   ├── pages/
│   │   ├── BicycleDetail.tsx      # 腳踏車詳情頁
│   │   ├── Checkout.tsx           # 結帳頁
│   │   ├── Index.tsx              # 首頁
│   │   ├── Login.tsx              # 登入頁
│   │   ├── Messages.tsx           # 訊息頁
│   │   ├── Profile.tsx            # 個人檔案頁
│   │   ├── Register.tsx           # 註冊頁
│   │   └── UploadBike.tsx         # 上架頁
│   ├── types/                     # TypeScript類型定義
│   ├── utils/                     # 工具函數
│   ├── App.tsx                    # 應用入口
│   └── index.tsx                  # 渲染入口
├── tailwind.config.js             # Tailwind配置
└── package.json                   # 專案依賴
```

### 主要頁面和組件

1. **首頁 (Index.tsx)**：

    - 展示特色腳踏車
    - 搜尋功能
    - 分類導航

2. **腳踏車詳情頁 (BicycleDetail.tsx)**：

    - 詳細規格展示
    - 圖片展示
    - 聯繫賣家功能
    - 出價功能

3. **上架頁 (UploadBike.tsx)**：

    - 多步驟表單
    - 圖片上傳
    - 規格填寫
    - 定價和位置設定

4. **訊息頁 (Messages.tsx)**：

    - 對話列表
    - 即時通訊介面
    - 出價功能

5. **個人檔案頁 (Profile.tsx)**：
    - 用戶資料管理
    - 發布的腳踏車管理
    - 訂單歷史
    - 通訊記錄

## 認證與授權機制

### JWT 雙令牌機制

本系統實作了基於 JWT 的雙令牌機制：

1. **Access Token**：

    - 短期有效 (通常 1 小時)
    - 存儲於 HttpOnly Cookie 中
    - 用於 API 請求的身份驗證

2. **Refresh Token**：

    - 長期有效 (通常 7 天)
    - 存儲於 HttpOnly Cookie 中
    - 存儲在資料庫中，支援撤銷功能
    - 用於更新過期的 Access Token

3. **工作流程**：
    - 用戶登入時同時獲取 Access Token 和 Refresh Token
    - 當 Access Token 過期，使用 Refresh Token 自動獲取新的 Access Token
    - Refresh Token 使用後立即更新，實現單次使用機制
    - 登出時撤銷所有 Refresh Token

### CSRF 保護

-   實作了專門的 CSRF 保護機制
-   CSRF 令牌通過不同的 Cookie 傳遞
-   前端每次請求都會自動附加 CSRF 令牌

### 社交登入

-   支援 Google、Facebook OAuth 登入
-   通過 OmniAuth 實現身份驗證
-   自動關聯或創建用戶帳戶

## 服務連接與狀態管理

### 前端狀態管理

1. **React Context API**：

    - 全局應用狀態，如用戶認證狀態
    - 購物車狀態
    - 搜尋過濾器狀態

2. **狀態類型**：

    - **全局狀態**：用戶認證、主題設置等
    - **實體狀態**：列表、評論、交易等
    - **UI 狀態**：模態框、加載指示器等
    - **表單狀態**：使用 React Hook Form

3. **本地狀態**：
    - 與 UI 相關的臨時狀態使用`useState`
    - 複雜組件邏輯使用`useReducer`

### 前後端連接

1. **REST API**：

    - 標準化端點
    - 基於 Cookie 的 JWT 授權
    - 嚴格的版本控制 (v1)

2. **API 服務層**：
    - 自定義 API 客戶端
    - 自動處理認證令牌
    - 集中式錯誤處理

## 部署架構

```
┌─────────────────────────────────────────────────────┐
│                     Load Balancer                   │
└───────────────────────────┬─────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
┌───────────▼───────────┐       ┌───────────▼───────────┐
│    Frontend Service    │       │    Backend Service    │
│  (React.js - Nginx)    │       │   (Rails API - Puma)  │
└───────────────────────┘       └───────────┬───────────┘
                                            │
            ┌───────────────────────────────┼───────────────┐
            │                               │               │
┌───────────▼───┐                       ┌───▼───┐   ┌───────▼───────┐
│  PostgreSQL   │                       │ Redis │   │  Google GCS   │
└───────────────┘                       └───────┘   └───────────────┘
```

## 安全考量

1. **認證與授權**：

    - 基於 JWT 的雙令牌認證機制
    - HttpOnly 和 Secure Cookie
    - CSRF 令牌保護

2. **資料保護**：

    - HTTPS 加密所有通訊
    - 密碼使用 bcrypt 雜湊
    - 參數驗證防止 SQL 注入

3. **安全標頭**：
    - CORS 策略
    - 內容安全策略
    - XSS 防護
