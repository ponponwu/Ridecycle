import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { IUser, IBankAccount } from '@/types/auth.types'
import BankAccountForm from './BankAccountForm'
import { userService } from '@/api/services/user.service'

interface PersonalInfoProps {
    user: IUser
}

const PersonalInfo = ({ user }: PersonalInfoProps) => {
    const [bankAccount, setBankAccount] = useState<IBankAccount | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchUserProfile()
    }, [])

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true)

            const response = await userService.getUserProfile()

            if (response.success) {
                setBankAccount(response.data.bank_account)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '載入用戶資料失敗')
        } finally {
            setIsLoading(false)
        }
    }

    const handleBankAccountUpdate = (updatedBankAccount: IBankAccount) => {
        setBankAccount(updatedBankAccount)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar || ''} alt={user.fullName || '用戶頭像'} />
                    <AvatarFallback className="text-xl">{(user.fullName || user.email || 'U')[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-2xl font-bold">{user.fullName || '用戶'}</h2>
                    <p className="text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-500">
                        加入時間：{new Date(user.createdAt).toLocaleDateString('zh-TW')}
                    </p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-medium mb-4">個人資料</h3>
                        <dl className="grid gap-2 text-sm">
                            <div className="grid grid-cols-3 gap-1 py-2 border-b last:border-0">
                                <dt className="font-medium text-gray-500">全名</dt>
                                <dd className="col-span-2">{user.fullName || '未設置'}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-1 py-2 border-b last:border-0">
                                <dt className="font-medium text-gray-500">電子郵箱</dt>
                                <dd className="col-span-2">{user.email}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-1 py-2 border-b last:border-0">
                                <dt className="font-medium text-gray-500">手機號碼</dt>
                                <dd className="col-span-2">{user.phone || '未設置'}</dd>
                            </div>
                            <div className="grid grid-cols-3 gap-1 py-2 last:border-0">
                                <dt className="font-medium text-gray-500">地址</dt>
                                <dd className="col-span-2">{user.address || '未設置'}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <BankAccountForm bankAccount={bankAccount} onUpdate={handleBankAccountUpdate} />
            </div>
        </div>
    )
}

export default PersonalInfo
