// src/types/auth.types.ts
/**
 * 用戶角色枚舉
 */
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    MODERATOR = 'moderator',
}

/**
 * 用戶信息介面
 */
export interface IUser {
    id: string
    email: string
    username?: string
    fullName: string
    role: UserRole
    avatar?: string
    phone?: string
    address?: string
    createdAt: string
    updatedAt: string
    isVerified: boolean
    lastLoginAt?: string
    ratingAverage?: number
    reviewCount?: number
}

/**
 * 用戶登錄請求介面
 */
export interface ILoginRequest {
    email: string
    password: string
    rememberMe?: boolean
}

/**
 * 用戶登錄響應介面
 */
export interface ILoginResponse {
    user: IUser
    token: string
    expiresAt: number
}

/**
 * 用戶註冊請求介面
 */
export interface IRegisterRequest {
    email: string
    password: string
    passwordConfirmation: string
    fullName: string
    phone?: string
    agreement: boolean
}

/**
 * 用戶註冊響應介面
 */
export interface IRegisterResponse {
    user: IUser
    token: string
    expiresAt: number
}

/**
 * 社交媒體登錄請求介面
 */
export interface ISocialLoginRequest {
    provider: 'google' | 'facebook' | 'twitter'
    token: string
}

/**
 * 修改密碼請求介面
 */
export interface IChangePasswordRequest {
    currentPassword: string
    newPassword: string
    passwordConfirmation: string
}

/**
 * 重設密碼請求介面
 */
export interface IResetPasswordRequest {
    token: string
    newPassword: string
    passwordConfirmation: string
}

/**
 * 請求重設密碼介面
 */
export interface IForgotPasswordRequest {
    email: string
}

/**
 * 用戶資料更新介面
 */
export interface IUpdateProfileRequest {
    fullName?: string
    phone?: string
    address?: string
    avatar?: File
}

/**
 * 驗證響應介面
 */
export interface IVerificationResponse {
    message: string
    isVerified: boolean
}
