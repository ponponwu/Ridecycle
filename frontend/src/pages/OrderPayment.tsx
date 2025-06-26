import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2, ArrowLeft, AlertCircle, Copy, Check, Upload } from 'lucide-react'
import { orderService } from '@/api/services/order.service'
import { IOrder } from '@/types/order.types'
import { extractData } from '@/api/client'
import { formatPriceNTD } from '@/utils/priceFormatter'
import { useToast } from '@/components/ui/use-toast'

const OrderPayment: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { toast } = useToast()

    const [order, setOrder] = useState<IOrder | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [proofFile, setProofFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        if (id) {
            loadOrder(id)
        }
    }, [id])

    const loadOrder = async (orderId: string) => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await orderService.getOrderById(orderId)
            const orderData = extractData(response) as IOrder
            setOrder(orderData)
        } catch (error) {
            console.error('Failed to load order:', error)
            setError(error instanceof Error ? error.message : '載入訂單失敗')
        } finally {
            setIsLoading(false)
        }
    }

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedField(field)
            toast({
                title: '已複製',
                description: '已複製到剪貼板',
            })
            setTimeout(() => setCopiedField(null), 2000)
        } catch (error) {
            toast({
                title: '複製失敗',
                description: '無法複製到剪貼板',
                variant: 'destructive',
            })
        }
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // 檢查檔案大小 (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: '檔案太大',
                    description: '請選擇小於 5MB 的檔案',
                    variant: 'destructive',
                })
                return
            }

            // 檢查檔案類型
            if (!file.type.startsWith('image/')) {
                toast({
                    title: '檔案格式錯誤',
                    description: '請選擇圖片檔案',
                    variant: 'destructive',
                })
                return
            }

            setProofFile(file)
        }
    }

    const handleUploadProof = async () => {
        if (!proofFile || !order) return

        setIsUploading(true)
        try {
            const result = await orderService.uploadPaymentProof(order.id, proofFile)

            if (result.success) {
                toast({
                    title: '上傳成功',
                    description: result.message || '轉帳證明已上傳，請等待確認',
                })

                // 返回訂單詳情頁面
                navigate(`/orders/${order.id}`)
            } else {
                toast({
                    title: '上傳失敗',
                    description: result.message || '上傳轉帳證明時發生錯誤',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            console.error('Upload payment proof error:', error)
            toast({
                title: '上傳失敗',
                description: error instanceof Error ? error.message : '上傳轉帳證明時發生錯誤',
                variant: 'destructive',
            })
        } finally {
            setIsUploading(false)
        }
    }

    if (isLoading) {
        return (
            <MainLayout>
                <div className="container max-w-4xl mx-auto px-4 py-8">
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="ml-2">{t('loading')}</span>
                    </div>
                </div>
            </MainLayout>
        )
    }

    if (error || !order) {
        return (
            <MainLayout>
                <div className="container max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <div className="text-red-500 mb-4">{error || '訂單未找到'}</div>
                        <div className="space-x-4">
                            <Button onClick={() => navigate(-1)} variant="outline">
                                {t('goBack')}
                            </Button>
                            <Button onClick={() => id && loadOrder(id)}>{t('tryAgain')}</Button>
                        </div>
                    </div>
                </div>
            </MainLayout>
        )
    }

    // 如果訂單已付款或已確認，重導向到訂單詳情
    if (order.paymentStatus === 'paid') {
        navigate(`/orders/${order.id}`, { replace: true })
        return null
    }

    // 如果已上傳付款證明，顯示審核中狀態
    const hasUploadedProof = order.paymentProofInfo?.hasProof

    // 如果訂單已過期，顯示過期提示
    if (order.expired) {
        return (
            <MainLayout>
                <div className="container max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-red-600 mb-4">訂單已過期</h2>
                        <p className="text-gray-600 mb-6">此訂單的付款期限已過，無法繼續付款。</p>
                        <Button onClick={() => navigate('/orders')} variant="outline">
                            返回訂單列表
                        </Button>
                    </div>
                </div>
            </MainLayout>
        )
    }

    const bankInfo = {
        bankName: '玉山銀行',
        bankCode: '808',
        accountNumber: '1234567890123',
        accountName: 'RideCycle 二手自行車交易平台有限公司',
        branch: '台北分行',
    }

    return (
        <MainLayout>
            <div className="container max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        返回訂單詳情
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">完成付款</h1>
                        <p className="text-gray-500">訂單編號: {order.orderNumber || order.id}</p>
                    </div>
                </div>

                {/* Payment Status Information */}
                {hasUploadedProof ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-800 mb-1">
                                    {order.paymentProofInfo?.status === 'approved'
                                        ? '付款已確認'
                                        : order.paymentProofInfo?.status === 'rejected'
                                        ? '付款證明被拒絕，請重新上傳'
                                        : order.paymentStatus === 'awaiting_confirmation'
                                        ? '付款待確認'
                                        : '付款證明已上傳'}
                                </h4>
                                <p className="text-sm text-blue-700">
                                    {order.paymentProofInfo?.status === 'approved'
                                        ? '您的付款已確認，我們將盡快安排出貨。'
                                        : order.paymentProofInfo?.status === 'rejected'
                                        ? '您的付款證明未通過審核，請重新上傳清晰的轉帳證明。'
                                        : order.paymentStatus === 'awaiting_confirmation'
                                        ? '我們已收到您的轉帳資訊，正在確認付款。一般在24小時內完成確認。'
                                        : '我們已收到您的付款證明，正在進行確認。一般在24小時內完成審核。'}
                                </p>
                                {order.paymentProofInfo?.uploadedAt && (
                                    <p className="text-xs text-blue-600 mt-2">
                                        上傳時間：{new Date(order.paymentProofInfo.uploadedAt).toLocaleString('zh-TW')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-orange-800 mb-1">請於期限內完成付款</h4>
                                <p className="text-sm text-orange-700">
                                    {order.remainingPaymentTimeHumanized &&
                                        `剩餘時間：${order.remainingPaymentTimeHumanized}`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Bank Transfer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>銀行轉帳資訊</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">銀行名稱</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{bankInfo.bankName}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(bankInfo.bankName, 'bankName')}
                                        >
                                            {copiedField === 'bankName' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">銀行代碼</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{bankInfo.bankCode}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(bankInfo.bankCode, 'bankCode')}
                                        >
                                            {copiedField === 'bankCode' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">帳號</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{bankInfo.accountNumber}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(bankInfo.accountNumber, 'accountNumber')}
                                        >
                                            {copiedField === 'accountNumber' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">戶名</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{bankInfo.accountName}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(bankInfo.accountName, 'accountName')}
                                        >
                                            {copiedField === 'accountName' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">分行</span>
                                    <span className="font-medium">{bankInfo.branch}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">轉帳金額</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-green-600">
                                            {formatPriceNTD(order.totalPrice)}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(order.totalPrice.toString(), 'amount')}
                                        >
                                            {copiedField === 'amount' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">轉帳備註</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{order.orderNumber || order.id}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(order.orderNumber || order.id, 'note')}
                                        >
                                            {copiedField === 'note' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upload Payment Proof */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {hasUploadedProof
                                    ? order.paymentProofInfo?.status === 'rejected'
                                        ? '重新上傳轉帳證明'
                                        : '更新轉帳證明'
                                    : '上傳轉帳證明'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600">
                                {hasUploadedProof
                                    ? order.paymentProofInfo?.status === 'rejected'
                                        ? '您的付款證明未通過審核，請重新上傳清晰的轉帳證明。'
                                        : '如需更新轉帳證明，請重新選擇並上傳檔案。'
                                    : '完成轉帳後，請上傳轉帳證明以加速訂單確認。'}
                            </p>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-4">點擊選擇檔案或拖拽檔案到此處</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="proof-upload"
                                />
                                <label htmlFor="proof-upload">
                                    <Button variant="outline" asChild>
                                        <span>選擇檔案</span>
                                    </Button>
                                </label>
                            </div>

                            {proofFile && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">已選擇檔案:</p>
                                    <p className="font-medium">{proofFile.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            )}

                            <Button onClick={handleUploadProof} disabled={!proofFile || isUploading} className="w-full">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        上傳中...
                                    </>
                                ) : (
                                    '上傳轉帳證明'
                                )}
                            </Button>

                            <p className="text-xs text-gray-500">支援 JPG、PNG 格式，檔案大小不超過 5MB</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Instructions */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>轉帳注意事項</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                            <li>請確認轉帳金額與訂單金額完全相符</li>
                            <li>轉帳備註請填入訂單編號，以便快速核對</li>
                            <li>上傳轉帳證明後，我們將在 24 小時內確認</li>
                            <li>確認轉帳後將立即安排出貨</li>
                            <li>如有任何問題，請聯繫客服</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    )
}

export default OrderPayment
