import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { IUser } from '@/types/auth.types'
import { messageService } from '@/api'
import { formatPriceNTD } from '@/utils/priceFormatter'

interface MakeOfferDialogProps {
    bicycleTitle: string
    bicycleId?: string
    currentUser: IUser | null
    sellerId?: string
    bicycleStatus?: string
}

const MakeOfferDialog = ({
    bicycleTitle,
    bicycleId = '1',
    currentUser,
    sellerId,
    bicycleStatus = 'available',
}: MakeOfferDialogProps) => {
    const [offer, setOffer] = useState('')
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { t } = useTranslation()
    const navigate = useNavigate()

    // 檢查是否為自己的腳踏車
    const isOwnBicycle = currentUser && sellerId && currentUser.id === sellerId

    // 檢查腳踏車是否已售出或不可用
    const isBicycleUnavailable = bicycleStatus !== 'available'

    const handleTriggerClick = () => {
        if (!currentUser) {
            navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
            return
        }

        // 如果是自己的腳踏車，顯示提示訊息
        if (isOwnBicycle) {
            toast({
                title: t('error'),
                description: '您不能對自己的腳踏車進行出價',
                variant: 'destructive',
            })
            return
        }

        // 如果腳踏車不可用，顯示提示訊息
        if (isBicycleUnavailable) {
            toast({
                title: t('error'),
                description: '此腳踏車已不可購買',
                variant: 'destructive',
            })
            return
        }

        setOpen(true)
    }

    const handleSubmitOffer = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!currentUser) {
            toast({
                title: t('error'),
                description: '請先登入',
                variant: 'destructive',
            })
            return
        }

        if (!sellerId) {
            toast({
                title: t('error'),
                description: '找不到賣家資訊',
                variant: 'destructive',
            })
            return
        }

        // 雙重檢查：防止對自己的腳踏車出價
        if (currentUser.id === sellerId) {
            toast({
                title: t('error'),
                description: '您不能對自己的腳踏車進行出價',
                variant: 'destructive',
            })
            return
        }

        const offerAmount = parseFloat(offer)
        if (isNaN(offerAmount) || offerAmount <= 0) {
            toast({
                title: t('error'),
                description: '請輸入有效的出價金額',
                variant: 'destructive',
            })
            return
        }

        setIsSubmitting(true)

        try {
            // 建立出價訊息
            const offerContent = `${t('offer')}: ${formatPriceNTD(offerAmount)}`
            await messageService.sendMessage({
                recipientId: sellerId,
                content: offerContent,
                bicycleId: bicycleId,
                isOffer: true,
                offerAmount: offerAmount,
            })

            // 顯示成功訊息
            toast({
                title: t('offerSent'),
                description: `${t('yourOfferFor')} ${formatPriceNTD(offerAmount)} ${t('hasBeenSent')}`,
            })

            // 關閉對話框並重置表單
            setOpen(false)
            setOffer('')

            // 導航到訊息頁面
            navigate(`/messages/${sellerId}`)
        } catch (error: unknown) {
            console.error('Failed to make offer:', error)

            // 處理重複出價的錯誤
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as {
                    response?: {
                        status?: number
                        data?: {
                            existing_offer?: { amount: number }
                            errors?: string[] | Array<{ detail?: string; title?: string }>
                        }
                    }
                }

                if (axiosError.response?.status === 422 && axiosError.response?.data?.existing_offer) {
                    const existingOffer = axiosError.response.data.existing_offer
                    toast({
                        title: '已有待回應的出價',
                        description: `您已經有一個 ${formatPriceNTD(existingOffer.amount)} 的出價在等待回應`,
                        variant: 'destructive',
                    })
                    return
                }

                // 處理其他 API 錯誤
                let errorMessage = t('unknownErrorOccurred')

                if (axiosError.response?.data?.errors?.[0]) {
                    const firstError = axiosError.response.data.errors[0]
                    if (typeof firstError === 'string') {
                        // 傳統錯誤格式
                        errorMessage = firstError
                    } else if (typeof firstError === 'object' && firstError.detail) {
                        // JSON:API 錯誤格式
                        errorMessage = firstError.detail
                    }
                }

                toast({
                    title: t('errorSendingMessage'),
                    description: errorMessage,
                    variant: 'destructive',
                })
            } else {
                // 處理網絡錯誤或其他錯誤
                toast({
                    title: t('errorSendingMessage'),
                    description: error instanceof Error ? error.message : t('unknownErrorOccurred'),
                    variant: 'destructive',
                })
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={`w-full ${isOwnBicycle || isBicycleUnavailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleTriggerClick}
                    disabled={isOwnBicycle || isBicycleUnavailable}
                >
                    {isOwnBicycle ? '這是您的腳踏車' : isBicycleUnavailable ? '已售出' : t('makeAnOffer')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('makeOffer')}</DialogTitle>
                    <DialogDescription>
                        {t('yourOffer')} ({bicycleTitle})
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitOffer}>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-4">
                            <DollarSign className="h-5 w-5 text-gray-500" />
                            <Input
                                type="number"
                                min="1"
                                value={offer}
                                onChange={(e) => setOffer(e.target.value)}
                                placeholder="輸入您的出價金額"
                                className="col-span-3"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? t('submitting') : t('submit')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default MakeOfferDialog
