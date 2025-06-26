import React, { useState, useReducer } from 'react'
import { IBankAccount, IUpdateBankAccountRequest } from '@/types/auth.types'
import { userService } from '@/api/services/user.service'

interface BankAccountFormProps {
    bankAccount: IBankAccount | null
    onUpdate: (bankAccount: IBankAccount) => void
}

// 狀態管理優化：使用 useReducer 統一管理相關狀態
interface FormState {
    isEditing: boolean
    isLoading: boolean
    error: string | null
    success: string | null
}

type FormAction =
    | { type: 'SET_EDITING'; payload: boolean }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_SUCCESS'; payload: string | null }
    | { type: 'CLEAR_MESSAGES' }
    | { type: 'RESET_FORM' }

const formReducer = (state: FormState, action: FormAction): FormState => {
    switch (action.type) {
        case 'SET_EDITING':
            return { ...state, isEditing: action.payload }
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload }
        case 'SET_ERROR':
            return { ...state, error: action.payload, success: null }
        case 'SET_SUCCESS':
            return { ...state, success: action.payload, error: null }
        case 'CLEAR_MESSAGES':
            return { ...state, error: null, success: null }
        case 'RESET_FORM':
            return { isEditing: false, isLoading: false, error: null, success: null }
        default:
            return state
    }
}

const BankAccountForm = ({ bankAccount, onUpdate }: BankAccountFormProps) => {
    const [state, dispatch] = useReducer(formReducer, {
        isEditing: false,
        isLoading: false,
        error: null,
        success: null,
    })

    const [formData, setFormData] = useState<IUpdateBankAccountRequest>({
        bank_account_name: bankAccount?.accountName || '',
        bank_account_number: bankAccount?.accountNumber || '',
        bank_code: bankAccount?.bankCode || '',
        bank_branch: bankAccount?.bankBranch || '',
    })

    const handleInputChange = (field: keyof IUpdateBankAccountRequest, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        // 清除錯誤訊息
        if (state.error || state.success) {
            dispatch({ type: 'CLEAR_MESSAGES' })
        }
    }

    const validateForm = (): boolean => {
        if (!formData.bank_account_name.trim()) {
            dispatch({ type: 'SET_ERROR', payload: '請輸入銀行戶名' })
            return false
        }

        if (!formData.bank_account_number.trim()) {
            dispatch({ type: 'SET_ERROR', payload: '請輸入銀行帳號' })
            return false
        }

        // 驗證帳號格式（只能包含數字和連字符）
        if (!/^[\d-]+$/.test(formData.bank_account_number)) {
            dispatch({ type: 'SET_ERROR', payload: '銀行帳號只能包含數字和連字符' })
            return false
        }

        if (!formData.bank_code.trim()) {
            dispatch({ type: 'SET_ERROR', payload: '請輸入銀行代碼' })
            return false
        }

        // 驗證銀行代碼格式（必須為3位數字）
        if (!/^\d{3}$/.test(formData.bank_code)) {
            dispatch({ type: 'SET_ERROR', payload: '銀行代碼必須為3位數字' })
            return false
        }

        if (!formData.bank_branch.trim()) {
            dispatch({ type: 'SET_ERROR', payload: '請輸入分行名稱' })
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'CLEAR_MESSAGES' })

        try {
            const response = await userService.updateBankAccount(formData)

            if (response.success) {
                dispatch({ type: 'SET_SUCCESS', payload: response.data.message })
                onUpdate(response.data.bank_account)
                dispatch({ type: 'SET_EDITING', payload: false })
            }
        } catch (err) {
            dispatch({
                type: 'SET_ERROR',
                payload: err instanceof Error ? err.message : '更新銀行帳戶失敗',
            })
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }

    const handleCancel = () => {
        setFormData({
            bank_account_name: bankAccount?.accountName || '',
            bank_account_number: bankAccount?.accountNumber || '',
            bank_code: bankAccount?.bankCode || '',
            bank_branch: bankAccount?.bankBranch || '',
        })
        dispatch({ type: 'RESET_FORM' })
    }

    const handleEdit = () => {
        dispatch({ type: 'SET_EDITING', payload: true })
        dispatch({ type: 'CLEAR_MESSAGES' })
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900">銀行帳戶資訊</h3>
                </div>
                {!state.isEditing && (
                    <button
                        onClick={handleEdit}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {bankAccount ? '編輯' : '設置'}
                    </button>
                )}
            </div>

            <div className="p-6">
                {state.error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex">
                            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <p className="ml-2 text-sm text-red-700">{state.error}</p>
                        </div>
                    </div>
                )}

                {state.success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex">
                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <p className="ml-2 text-sm text-green-700">{state.success}</p>
                        </div>
                    </div>
                )}

                {!bankAccount && !state.isEditing && (
                    <div className="text-center py-8">
                        <svg
                            className="h-12 w-12 mx-auto text-gray-400 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                        </svg>
                        <p className="text-gray-500 mb-4">尚未設置銀行帳戶資訊</p>
                        <p className="text-sm text-gray-400 mb-4">設置銀行帳戶後，才能接收售出商品的款項</p>
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            立即設置
                        </button>
                    </div>
                )}

                {bankAccount && !state.isEditing && (
                    <dl className="grid gap-2 text-sm">
                        <div className="grid grid-cols-3 gap-1 py-2 border-b">
                            <dt className="font-medium text-gray-500">戶名</dt>
                            <dd className="col-span-2">{bankAccount.accountName}</dd>
                        </div>
                        <div className="grid grid-cols-3 gap-1 py-2 border-b">
                            <dt className="font-medium text-gray-500">帳號</dt>
                            <dd className="col-span-2">{bankAccount.accountNumber}</dd>
                        </div>
                        <div className="grid grid-cols-3 gap-1 py-2 border-b">
                            <dt className="font-medium text-gray-500">銀行代碼</dt>
                            <dd className="col-span-2">{bankAccount.bankCode}</dd>
                        </div>
                        <div className="grid grid-cols-3 gap-1 py-2">
                            <dt className="font-medium text-gray-500">分行</dt>
                            <dd className="col-span-2">{bankAccount.bankBranch}</dd>
                        </div>
                    </dl>
                )}

                {state.isEditing && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <label htmlFor="bank_account_name" className="block text-sm font-medium text-gray-700">
                                    銀行戶名 *
                                </label>
                                <input
                                    id="bank_account_name"
                                    type="text"
                                    value={formData.bank_account_name}
                                    onChange={(e) => handleInputChange('bank_account_name', e.target.value)}
                                    placeholder="請輸入銀行戶名"
                                    disabled={state.isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="bank_account_number"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    銀行帳號 *
                                </label>
                                <input
                                    id="bank_account_number"
                                    type="text"
                                    value={formData.bank_account_number}
                                    onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                                    placeholder="例：123-456-789"
                                    disabled={state.isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                                <p className="text-xs text-gray-500">只能包含數字和連字符</p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="bank_code" className="block text-sm font-medium text-gray-700">
                                    銀行代碼 *
                                </label>
                                <input
                                    id="bank_code"
                                    type="text"
                                    value={formData.bank_code}
                                    onChange={(e) => handleInputChange('bank_code', e.target.value)}
                                    placeholder="例：004"
                                    maxLength={3}
                                    disabled={state.isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                                <p className="text-xs text-gray-500">必須為3位數字</p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="bank_branch" className="block text-sm font-medium text-gray-700">
                                    分行名稱 *
                                </label>
                                <input
                                    id="bank_branch"
                                    type="text"
                                    value={formData.bank_branch}
                                    onChange={(e) => handleInputChange('bank_branch', e.target.value)}
                                    placeholder="例：台北分行"
                                    disabled={state.isLoading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button
                                type="submit"
                                disabled={state.isLoading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
                            >
                                {state.isLoading ? '更新中...' : '保存'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={state.isLoading}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                取消
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default BankAccountForm
