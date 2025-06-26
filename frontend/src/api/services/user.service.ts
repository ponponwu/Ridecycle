import apiClient from '../client'
import type {
    IUser,
    IBankAccount,
    IUpdateBankAccountRequest,
    IUserProfileResponse,
    IBankAccountUpdateResponse,
    IUpdateProfileRequest,
    IUpdateProfileResponse,
} from '@/types/auth.types'

// 擴展 IUser 介面以包含 bankAccountInfo
interface IUserWithBankAccount extends IUser {
    bankAccountInfo?: IBankAccount | null
}

// 銀行帳戶 API 響應格式
interface IBankAccountApiResponse {
    bankAccount?: IBankAccount
    message?: string
}

/**
 * 用戶 API 服務類別
 * 使用現有的 apiClient 進行 API 通信
 */
class UserService {
    /**
     * 獲取用戶個人檔案（包括銀行帳戶資訊）
     */
    async getUserProfile(): Promise<IUserProfileResponse> {
        const response = await apiClient.get<IUserWithBankAccount>('users/profile')
        // 處理 apiClient 返回的 JSONAPIResponse 格式
        const userData = Array.isArray(response.data) ? response.data[0] : response.data

        return {
            success: true,
            data: {
                user: userData,
                bank_account: userData.bankAccountInfo || null,
            },
        }
    }

    /**
     * 更新用戶個人資料
     */
    async updateProfile(data: IUpdateProfileRequest): Promise<IUpdateProfileResponse> {
        const response = await apiClient.put<IUser>('users/profile', {
            user: data,
        })

        const userData = Array.isArray(response.data) ? response.data[0] : response.data

        return {
            success: true,
            data: {
                user: userData,
                message: '個人資料更新成功',
            },
        }
    }

    /**
     * 更新銀行帳戶資訊
     */
    async updateBankAccount(data: IUpdateBankAccountRequest): Promise<IBankAccountUpdateResponse> {
        const response = await apiClient.put<IBankAccountApiResponse>('users/bank_account', {
            bank_account: data,
        })

        const responseData = Array.isArray(response.data) ? response.data[0] : response.data

        return {
            success: true,
            data: {
                bank_account: responseData.bankAccount || null,
                message: responseData.message || '銀行帳戶更新成功',
            },
        }
    }
}

export const userService = new UserService()
