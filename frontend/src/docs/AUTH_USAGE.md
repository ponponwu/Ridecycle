# 認證系統使用指南

## 🎯 概述

本指南說明如何使用重構後的認證系統，包括 AuthContext、認證中間件和最佳實踐。

## 📚 核心組件

### 1. AuthContext

提供全域認證狀態管理，使用 `useReducer` 和 `useCallback` 優化效能。

```typescript
import { useAuth } from '@/contexts/AuthContext'

const MyComponent = () => {
    const { currentUser, isAuthenticated, isLoading, authStatus, login, logout } = useAuth()

    // 使用認證狀態
    if (authStatus === 'checking') {
        return <div>檢查認證狀態中...</div>
    }

    return <div>{isAuthenticated ? <p>歡迎, {currentUser?.name}!</p> : <p>請登入</p>}</div>
}
```

### 2. 認證狀態

新的 `authStatus` 提供更精確的狀態追蹤：

-   `'idle'`: 初始狀態
-   `'checking'`: 正在檢查認證狀態
-   `'authenticated'`: 已認證
-   `'unauthenticated'`: 未認證

## 🛡️ 認證中間件 (HOC)

### withAuth - 強制認證

保護需要登入的頁面：

```typescript
import { withAuth } from '@/components/auth/withAuth'

const ProtectedPage = () => {
    return <div>這是受保護的頁面</div>
}

export default withAuth(ProtectedPage)
```

### withAdminAuth - 管理員認證

保護管理員專用頁面：

```typescript
import { withAdminAuth } from '@/components/auth/withAuth'

const AdminPanel = () => {
    return <div>管理員面板</div>
}

export default withAdminAuth(AdminPanel)
```

### withGuestOnly - 訪客專用

只允許未登入用戶訪問（如登入、註冊頁面）：

```typescript
import { withGuestOnly } from '@/components/auth/withAuth'

const LoginPage = () => {
    return <div>登入頁面</div>
}

export default withGuestOnly(LoginPage)
```

### withOptionalAuth - 可選認證

不強制認證，但會等待認證狀態確定：

```typescript
import { withOptionalAuth } from '@/components/auth/withAuth'

const HomePage = () => {
    const { isAuthenticated } = useAuth()

    return <div>{isAuthenticated ? '歡迎回來!' : '歡迎訪問!'}</div>
}

export default withOptionalAuth(HomePage)
```

## 🔄 認證操作

### 登入

```typescript
const LoginForm = () => {
    const { login, isLoading, error } = useAuth()

    const handleSubmit = async (data: ILoginRequest) => {
        try {
            await login(data)
            // 登入成功，AuthContext 會自動更新狀態
            navigate('/dashboard')
        } catch (err) {
            // 錯誤已經在 AuthContext 中處理
            console.error('登入失敗:', err)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}
            {/* 表單欄位 */}
            <button disabled={isLoading}>{isLoading ? '登入中...' : '登入'}</button>
        </form>
    )
}
```

### 登出

```typescript
const LogoutButton = () => {
    const { logout, isLoading } = useAuth()

    const handleLogout = async () => {
        try {
            await logout()
            // 登出成功，會自動清除狀態
        } catch (err) {
            console.error('登出失敗:', err)
        }
    }

    return (
        <button onClick={handleLogout} disabled={isLoading}>
            {isLoading ? '登出中...' : '登出'}
        </button>
    )
}
```

### 更新用戶資料

```typescript
const ProfileForm = () => {
    const { updateProfile, currentUser, isLoading } = useAuth()

    const handleUpdate = async (data: IUpdateProfileRequest) => {
        try {
            await updateProfile(data)
            // 用戶資料已更新
        } catch (err) {
            console.error('更新失敗:', err)
        }
    }

    return (
        <form onSubmit={handleUpdate}>
            <input defaultValue={currentUser?.name} />
            <button disabled={isLoading}>更新</button>
        </form>
    )
}
```

## 🚀 效能優化

### 1. useCallback 優化

所有認證方法都使用 `useCallback` 包裝，避免不必要的重新渲染：

```typescript
// ✅ 好的做法 - 函數引用穩定
const { login } = useAuth()

useEffect(() => {
    // login 函數引用穩定，不會造成無限循環
}, [login])
```

### 2. 記憶體快取

-   5 分鐘快取時間
-   頁面刷新自動清除
-   背景更新確保資料新鮮度

### 3. 狀態管理

使用 `useReducer` 替代多個 `useState`，提供：

-   更好的狀態一致性
-   更容易的狀態追蹤
-   更少的重新渲染

## 🔍 除錯和監控

### 檢查認證狀態

```typescript
const DebugAuth = () => {
    const auth = useAuth()

    return (
        <div>
            <h3>認證狀態除錯</h3>
            <pre>{JSON.stringify(auth, null, 2)}</pre>
        </div>
    )
}
```

### 手動刷新用戶資料

```typescript
const RefreshButton = () => {
    const { refreshUser, isLoading } = useAuth()

    return (
        <button onClick={refreshUser} disabled={isLoading}>
            刷新用戶資料
        </button>
    )
}
```

## 📋 最佳實踐

### 1. 錯誤處理

```typescript
const MyComponent = () => {
    const { error, clearError } = useAuth()

    useEffect(() => {
        if (error) {
            // 顯示錯誤訊息
            toast.error(error)
            // 清除錯誤狀態
            clearError()
        }
    }, [error, clearError])
}
```

### 2. 載入狀態

```typescript
const MyComponent = () => {
    const { isLoading, authStatus } = useAuth()

    if (isLoading || authStatus === 'checking') {
        return <LoadingSpinner />
    }

    // 渲染主要內容
}
```

### 3. 條件渲染

```typescript
const Navigation = () => {
    const { isAuthenticated, currentUser } = useAuth()

    return (
        <nav>
            {isAuthenticated ? (
                <>
                    <span>歡迎, {currentUser?.name}</span>
                    <LogoutButton />
                </>
            ) : (
                <Link to="/login">登入</Link>
            )}
        </nav>
    )
}
```

## ⚠️ 注意事項

1. **不要**在 localStorage 中儲存敏感資料
2. **使用** HOC 保護路由而非手動檢查
3. **依賴** authStatus 而非 isLoading 進行精確的狀態判斷
4. **清除**錯誤狀態避免持續顯示舊錯誤
5. **測試**各種認證場景確保正確性

## 🧪 測試範例

```typescript
// 測試認證狀態變化
const TestComponent = () => {
    const { authStatus, checkAuthStatus } = useAuth()

    return (
        <div>
            <p>當前狀態: {authStatus}</p>
            <button onClick={checkAuthStatus}>重新檢查認證狀態</button>
        </div>
    )
}
```
