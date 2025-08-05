import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, Settings, Eye, EyeOff } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import apiClient from '@/api/client'

interface AccountSettingsProps {
    onSignOut: () => Promise<void>
}

interface UserProfile {
    is_oauth_user?: boolean
    needs_password_setup?: boolean
    oauth_provider?: string
}

const AccountSettings = ({ onSignOut }: AccountSettingsProps) => {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

    // Password change state
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    })

    // Account deletion state
    const [deleteData, setDeleteData] = useState({
        password: '',
        confirmation: '',
    })
    const [showDeletePassword, setShowDeletePassword] = useState(false)

    // Fetch user profile to determine OAuth status
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await apiClient.get('users/profile')
                setUserProfile(response.data)
            } catch (error) {
                console.error('Failed to fetch user profile:', error)
            }
        }
        fetchUserProfile()
    }, [])

    const handlePasswordChange = async () => {
        const isOAuthSetup = userProfile?.needs_password_setup
        
        // OAuth 用戶首次設置密碼時不需要輸入當前密碼
        if (isOAuthSetup) {
            if (!passwordData.new_password || !passwordData.new_password_confirmation) {
                toast({
                    title: '錯誤',
                    description: '請填寫新密碼和確認密碼',
                    variant: 'destructive',
                })
                return
            }
        } else {
            // 一般用戶需要填寫所有欄位
            if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirmation) {
                toast({
                    title: '錯誤',
                    description: '請填寫所有密碼欄位',
                    variant: 'destructive',
                })
                return
            }
        }

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            toast({
                title: '錯誤',
                description: '新密碼確認不匹配',
                variant: 'destructive',
            })
            return
        }

        if (passwordData.new_password.length < 6) {
            toast({
                title: '錯誤',
                description: '新密碼必須至少6個字符',
                variant: 'destructive',
            })
            return
        }

        setIsLoading(true)
        try {
            await apiClient.put('users/change_password', {
                password_change: passwordData,
            })

            toast({
                title: '成功',
                description: '密碼更改成功',
                variant: 'default',
            })

            // Reset form
            setPasswordData({
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            })
        } catch (error: unknown) {
            // Extract error message from JSON:API format or fallback to default
            const axiosError = error as { response?: { data?: { errors?: Array<{ detail?: string }>, message?: string } } }
            const errorData = axiosError.response?.data?.errors?.[0]
            const errorMessage = typeof errorData === 'object' && errorData?.detail 
                ? errorData.detail 
                : typeof errorData === 'string' 
                    ? errorData 
                    : axiosError.response?.data?.message || '密碼更改失敗'
            
            toast({
                title: '錯誤',
                description: errorMessage,
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!deleteData.password || deleteData.confirmation !== 'DELETE') {
            toast({
                title: '錯誤',
                description: "請輸入密碼並輸入 'DELETE' 以確認",
                variant: 'destructive',
            })
            return
        }

        setIsLoading(true)
        try {
            await apiClient.delete('users/account', {
                data: {
                    account_deletion: deleteData,
                },
            })

            toast({
                title: '成功',
                description: '帳號已成功刪除',
                variant: 'default',
            })

            // Sign out after account deletion
            setTimeout(() => {
                onSignOut()
            }, 2000)
        } catch (error: unknown) {
            // Extract error message from JSON:API format or fallback to default
            const axiosError = error as { response?: { data?: { errors?: Array<{ detail?: string }>, message?: string } } }
            const errorData = axiosError.response?.data?.errors?.[0]
            const errorMessage = typeof errorData === 'object' && errorData?.detail 
                ? errorData.detail 
                : typeof errorData === 'string' 
                    ? errorData 
                    : axiosError.response?.data?.message || '帳號刪除失敗'
            
            toast({
                title: '錯誤',
                description: errorMessage,
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium">帳號設置</h3>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="password">
                    <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex items-center">
                            <Settings className="h-5 w-5 mr-2" />
                            <span>
                                {userProfile?.needs_password_setup ? '設置密碼' : '更改密碼'}
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-1">
                        <div className="space-y-4 p-2">
                            {userProfile?.needs_password_setup && (
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                                    <p className="text-sm text-blue-800">
                                        您目前透過 {userProfile?.oauth_provider === 'facebook' ? 'Facebook' : 'Google'} 登入。
                                        設置密碼後，您可以選擇使用密碼或繼續使用社交媒體登入。
                                    </p>
                                </div>
                            )}
                            
                            {!userProfile?.needs_password_setup && (
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">目前密碼</Label>
                                    <div className="relative">
                                        <Input
                                            id="current-password"
                                            type={showPasswords.current ? 'text' : 'password'}
                                            value={passwordData.current_password}
                                            onChange={(e) =>
                                                setPasswordData((prev) => ({ ...prev, current_password: e.target.value }))
                                            }
                                            className="pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() =>
                                                setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                                            }
                                        >
                                            {showPasswords.current ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="new-password">新密碼</Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordData.new_password}
                                        onChange={(e) =>
                                            setPasswordData((prev) => ({ ...prev, new_password: e.target.value }))
                                        }
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                                    >
                                        {showPasswords.new ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">確認新密碼</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordData.new_password_confirmation}
                                        onChange={(e) =>
                                            setPasswordData((prev) => ({
                                                ...prev,
                                                new_password_confirmation: e.target.value,
                                            }))
                                        }
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() =>
                                            setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                                        }
                                    >
                                        {showPasswords.confirm ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <Button onClick={handlePasswordChange} disabled={isLoading} className="w-full">
                                {isLoading ? 
                                    (userProfile?.needs_password_setup ? '設置中...' : '更新中...') : 
                                    (userProfile?.needs_password_setup ? '設置密碼' : '更改密碼')
                                }
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="notifications">
                    <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex items-center">
                            <Settings className="h-5 w-5 mr-2" />
                            <span>通知設置</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-1">
                        <div className="space-y-2 p-2">
                            <p className="text-sm text-gray-500">設置您想接收的通知類型。</p>
                            <p className="text-sm text-gray-400">此功能將在未來版本中推出。</p>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="account">
                    <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex items-center">
                            <Settings className="h-5 w-5 mr-2" />
                            <span>帳號管理</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-1">
                        <div className="space-y-4 p-2">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-500">個人資料編輯請使用上方的「個人資訊」分頁。</p>
                            </div>

                            <div className="pt-4 border-t space-y-4">
                                <p className="text-sm font-medium text-red-600">危險操作區域</p>
                                <p className="text-sm text-gray-500">
                                    刪除您的帳號將永久移除所有數據，包括您的腳踏車、訊息和訂單記錄。
                                </p>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            刪除帳號
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>確認刪除帳號</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                此操作無法撤銷。這將永久刪除您的帳號和所有相關數據。
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>

                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="delete-password">請輸入您的密碼以確認</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="delete-password"
                                                        type={showDeletePassword ? 'text' : 'password'}
                                                        value={deleteData.password}
                                                        onChange={(e) =>
                                                            setDeleteData((prev) => ({
                                                                ...prev,
                                                                password: e.target.value,
                                                            }))
                                                        }
                                                        className="pr-10"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                                                    >
                                                        {showDeletePassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="delete-confirmation">請輸入 "DELETE" 以確認刪除</Label>
                                                <Input
                                                    id="delete-confirmation"
                                                    value={deleteData.confirmation}
                                                    onChange={(e) =>
                                                        setDeleteData((prev) => ({
                                                            ...prev,
                                                            confirmation: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="DELETE"
                                                />
                                            </div>
                                        </div>

                                        <AlertDialogFooter>
                                            <AlertDialogCancel
                                                onClick={() => setDeleteData({ password: '', confirmation: '' })}
                                            >
                                                取消
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDeleteAccount}
                                                disabled={
                                                    isLoading ||
                                                    !deleteData.password ||
                                                    deleteData.confirmation !== 'DELETE'
                                                }
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                {isLoading ? '刪除中...' : '確認刪除'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="pt-4 mt-6 border-t">
                <Button
                    variant="outline"
                    className="w-full sm:w-auto flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={onSignOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    登出帳號
                </Button>
            </div>
        </div>
    )
}

export default AccountSettings
