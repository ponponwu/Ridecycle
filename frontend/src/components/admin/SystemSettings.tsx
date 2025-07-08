import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { adminService, SiteConfiguration } from '@/services/admin.service'
import { clearBankInfoCache } from '@/constants/bankInfo'
import AdminLayout from '@/components/admin/AdminLayout'

const siteSettingsSchema = z.object({
    siteName: z.string().min(2).max(50),
    contactEmail: z.string().email(),
    enableRegistration: z.boolean().default(true),
    requireVerification: z.boolean().default(false),
    bicycleApprovalRequired: z.boolean().default(true),
})

const bankSettingsSchema = z.object({
    bankName: z.string().min(2).max(50),
    bankCode: z.string().min(3).max(5),
    accountNumber: z.string().min(5).max(20),
    accountName: z.string().min(2).max(50),
    bankBranch: z.string().min(2).max(50),
})

interface SystemSettingsProps {
    standalone?: boolean
}

const SystemSettingsContent: React.FC = () => {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const siteForm = useForm<z.infer<typeof siteSettingsSchema>>({
        resolver: zodResolver(siteSettingsSchema),
        defaultValues: {
            siteName: '',
            contactEmail: '',
            enableRegistration: true,
            requireVerification: false,
            bicycleApprovalRequired: true,
        },
    })

    const bankForm = useForm<z.infer<typeof bankSettingsSchema>>({
        resolver: zodResolver(bankSettingsSchema),
        defaultValues: {
            bankName: '',
            bankCode: '',
            accountNumber: '',
            accountName: '',
            bankBranch: '',
        },
    })

    useEffect(() => {
        fetchSettings()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const settings = await adminService.getSiteConfigurations()
            
            // 更新網站設定表單
            siteForm.reset({
                siteName: settings.siteName,
                contactEmail: settings.contactEmail,
                enableRegistration: settings.enableRegistration,
                requireVerification: settings.requireVerification,
                bicycleApprovalRequired: settings.bicycleApprovalRequired,
            })

            // 更新銀行設定表單
            bankForm.reset({
                bankName: settings.bankName,
                bankCode: settings.bankCode,
                accountNumber: settings.accountNumber,
                accountName: settings.accountName,
                bankBranch: settings.bankBranch,
            })
        } catch (error) {
            console.error('Error fetching settings:', error)
            toast({
                variant: 'destructive',
                title: '載入失敗',
                description: '無法載入系統設定',
            })
        } finally {
            setLoading(false)
        }
    }

    const onSiteSettingsSave = async (data: z.infer<typeof siteSettingsSchema>) => {
        setSaving(true)
        try {
            await adminService.updateSiteConfigurations(data)
            toast({
                title: '設定已儲存',
                description: '網站設定已成功更新',
            })
        } catch (error) {
            console.error('Error saving site settings:', error)
            toast({
                variant: 'destructive',
                title: '儲存失敗',
                description: '無法儲存網站設定',
            })
        } finally {
            setSaving(false)
        }
    }

    const onBankSettingsSave = async (data: z.infer<typeof bankSettingsSchema>) => {
        setSaving(true)
        try {
            await adminService.updateSiteConfigurations(data)
            // 清除銀行資訊快取，強制重新載入
            clearBankInfoCache()
            toast({
                title: '設定已儲存',
                description: '銀行設定已成功更新',
            })
        } catch (error) {
            console.error('Error saving bank settings:', error)
            toast({
                variant: 'destructive',
                title: '儲存失敗',
                description: '無法儲存銀行設定',
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">{t('admin.systemSettings')}</h1>
                <p className="text-gray-500">{t('admin.manageSystemConfiguration')}</p>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">一般設定</TabsTrigger>
                    <TabsTrigger value="bank">匯款資訊</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>網站配置</CardTitle>
                            <CardDescription>配置網站的基本設定</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...siteForm}>
                                <form onSubmit={siteForm.handleSubmit(onSiteSettingsSave)} className="space-y-6">
                                    <FormField
                                        control={siteForm.control}
                                        name="siteName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>網站名稱</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormDescription>顯示在網站頂部的名稱</FormDescription>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={siteForm.control}
                                        name="contactEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>聯絡信箱</FormLabel>
                                                <FormControl>
                                                    <Input type="email" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-4">
                                        <FormField
                                            control={siteForm.control}
                                            name="enableRegistration"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between">
                                                    <div>
                                                        <FormLabel>啟用用戶註冊</FormLabel>
                                                        <FormDescription>允許新用戶註冊帳戶</FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={siteForm.control}
                                            name="requireVerification"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between">
                                                    <div>
                                                        <FormLabel>要求信箱驗證</FormLabel>
                                                        <FormDescription>新用戶需要驗證信箱才能使用</FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={siteForm.control}
                                            name="bicycleApprovalRequired"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between">
                                                    <div>
                                                        <FormLabel>需要自行車審核</FormLabel>
                                                        <FormDescription>
                                                            自行車需要管理員審核後才能顯示
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={saving}>
                                            {saving ? '儲存中...' : '儲存變更'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bank">
                    <Card>
                        <CardHeader>
                            <CardTitle>匯款資訊設定</CardTitle>
                            <CardDescription>配置用戶轉帳時顯示的銀行帳戶資訊</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...bankForm}>
                                <form onSubmit={bankForm.handleSubmit(onBankSettingsSave)} className="space-y-6">
                                    <FormField
                                        control={bankForm.control}
                                        name="bankName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>銀行名稱</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="例如：玉山銀行" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={bankForm.control}
                                        name="bankCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>銀行代碼</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="例如：808" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={bankForm.control}
                                        name="accountNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>帳戶號碼</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="請輸入完整帳戶號碼" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={bankForm.control}
                                        name="accountName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>帳戶名稱</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="例如：RideCycle 有限公司" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={bankForm.control}
                                        name="bankBranch"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>分行名稱</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="例如：台北分行" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={saving}>
                                            {saving ? '儲存中...' : '儲存變更'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ standalone = true }) => {
    if (standalone) {
        return (
            <AdminLayout>
                <SystemSettingsContent />
            </AdminLayout>
        )
    }
    return <SystemSettingsContent />
}

export default SystemSettings
