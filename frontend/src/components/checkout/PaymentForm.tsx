import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Copy, Upload, CreditCard, Clock, AlertCircle } from 'lucide-react'
import { IPaymentInfo, COMPANY_BANK_ACCOUNT } from '@/types/checkout.types'
import { formatPriceNTD } from '@/utils/priceFormatter'

// 創建動態驗證 schema
const createPaymentSchema = (t: (key: string) => string) =>
    z.object({
        paymentMethod: z.literal('bankTransfer'),
        transferNote: z.string().min(1, { message: t('validation.required') }),
        accountLastFiveDigits: z
            .string()
            .min(5, { message: '請輸入完整的後五碼' })
            .max(5, { message: '請輸入完整的後五碼' })
            .regex(/^\d+$/, { message: '只能輸入數字' }),
        transferProof: z.instanceof(File).optional(),
    })

interface PaymentFormProps {
    initialValues?: Partial<IPaymentInfo>
    onSubmit: (data: IPaymentInfo) => void
    onBack: () => void
    totalAmount: number
}

const PaymentForm: React.FC<PaymentFormProps> = ({ initialValues = {}, onSubmit, onBack, totalAmount }) => {
    const { t } = useTranslation()
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)

    const paymentSchema = createPaymentSchema(t)

    const form = useForm<IPaymentInfo>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            paymentMethod: 'bankTransfer',
            transferNote: initialValues.transferNote || '',
            accountLastFiveDigits: initialValues.accountLastFiveDigits || '',
        },
    })

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        // 這裡可以添加 toast 通知
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setUploadedFile(file)
            form.setValue('transferProof', file)
        }
    }

    const handleSubmit = (data: IPaymentInfo) => {
        onSubmit({
            ...data,
            transferProof: uploadedFile || undefined,
        })
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">{t('paymentInformation')}</h2>

            {/* 轉帳說明卡片 */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                        <CreditCard className="w-5 h-5" />
                        {t('transferInstructions')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span>{t('transferDeadline')}</span>
                    </div>

                    <div>
                        <h4 className="font-medium text-blue-800 mb-2">{t('transferAmount')}</h4>
                        <div className="text-2xl font-bold text-blue-900">{formatPriceNTD(totalAmount)}</div>
                    </div>
                </CardContent>
            </Card>

            {/* 銀行帳戶資訊 */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('bankAccount')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{t('bankName')}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{COMPANY_BANK_ACCOUNT.bankName}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(COMPANY_BANK_ACCOUNT.bankName)}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{t('bankCode')}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{COMPANY_BANK_ACCOUNT.bankCode}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(COMPANY_BANK_ACCOUNT.bankCode)}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{t('accountNumber')}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-medium">{COMPANY_BANK_ACCOUNT.accountNumber}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(COMPANY_BANK_ACCOUNT.accountNumber)}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{t('accountName')}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{COMPANY_BANK_ACCOUNT.accountName}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(COMPANY_BANK_ACCOUNT.accountName)}
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {COMPANY_BANK_ACCOUNT.branch && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{t('branch')}</span>
                                <span className="font-medium">{COMPANY_BANK_ACCOUNT.branch}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 轉帳資訊表單 */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* 轉帳備註 */}
                    <FormField
                        control={form.control}
                        name="transferNote"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('transferNote')} *</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('transferNotePlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 轉帳帳戶後五碼 */}
                    <FormField
                        control={form.control}
                        name="accountLastFiveDigits"
                        render={({ field: { onChange, value, ...field } }) => (
                            <FormItem>
                                <FormLabel>{t('accountLastFiveDigits')} *</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={value}
                                        onChange={(e) => {
                                            // 只允許數字輸入，限制5位
                                            const numericValue = e.target.value.replace(/\D/g, '').slice(0, 5)
                                            onChange(numericValue)
                                        }}
                                        placeholder={t('accountDigitsPlaceholder')}
                                        className="w-full"
                                        maxLength={5}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 轉帳證明上傳 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('transferProof')}</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div className="text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-4">
                                    <label htmlFor="transfer-proof" className="cursor-pointer">
                                        <span className="mt-2 block text-sm font-medium text-gray-900">
                                            {t('uploadTransferProof')}
                                        </span>
                                        <span className="mt-1 block text-xs text-gray-500">
                                            {t('transferProofNote')}
                                        </span>
                                    </label>
                                    <input
                                        id="transfer-proof"
                                        type="file"
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                                {uploadedFile && (
                                    <div className="mt-2 text-sm text-green-600">✓ 已上傳：{uploadedFile.name}</div>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">支援 JPG、PNG、PDF 格式，檔案大小不超過 5MB</p>
                    </div>

                    {/* 注意事項 */}
                    <Card className="bg-amber-50 border-amber-200">
                        <CardContent className="pt-4">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800 space-y-1">
                                    <p className="font-medium">注意事項：</p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>請確保轉帳金額與訂單金額完全一致</li>
                                        <li>轉帳備註請填寫您的姓名，方便我們核對</li>
                                        <li>請保留轉帳收據，並上傳作為付款證明</li>
                                        <li>我們會在收到轉帳後 1-2 個工作日內確認付款</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 操作按鈕 */}
                    <div className="flex justify-between space-x-4 pt-4">
                        <Button type="button" variant="outline" onClick={onBack}>
                            {t('backToShipping')}
                        </Button>
                        <Button type="submit" className="min-w-32">
                            {t('reviewYourOrder')}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default PaymentForm
