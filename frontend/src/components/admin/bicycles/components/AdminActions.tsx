import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { Check, X, Loader2 } from 'lucide-react'
import { BicycleWithOwner } from '@/types/bicycle.types'

interface AdminActionsProps {
    bicycle: BicycleWithOwner
    onApprove: () => Promise<void>
    onReject: (reason?: string) => Promise<void>
}

const AdminActions: React.FC<AdminActionsProps> = ({ bicycle, onApprove, onReject }) => {
    const { t } = useTranslation()
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [showRejectDialog, setShowRejectDialog] = useState(false)

    const handleApprove = async () => {
        setIsApproving(true)
        try {
            await onApprove()
        } catch (error) {
            console.error('Error approving bicycle:', error)
        } finally {
            setIsApproving(false)
        }
    }

    const handleReject = async () => {
        setIsRejecting(true)
        try {
            await onReject(rejectionReason.trim() || undefined)
            setShowRejectDialog(false)
            setRejectionReason('')
        } catch (error) {
            console.error('Error rejecting bicycle:', error)
        } finally {
            setIsRejecting(false)
        }
    }

    // 如果不是待審核狀態，不顯示操作按鈕
    if (bicycle.status !== 'pending') {
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{t('admin.adminActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* 審核通過按鈕 */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            disabled={isApproving || isRejecting}
                        >
                            {isApproving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t('admin.approving')}
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    {t('admin.approveThisBicycle')}
                                </>
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('admin.confirmApproval')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('admin.approvalConfirmMessage')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                                {t('admin.approve')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* 拒絕按鈕 */}
                <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full border-red-200 text-red-700 hover:bg-red-50"
                            disabled={isApproving || isRejecting}
                        >
                            {isRejecting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t('admin.rejecting')}
                                </>
                            ) : (
                                <>
                                    <X className="h-4 w-4 mr-2" />
                                    {t('admin.rejectThisBicycle')}
                                </>
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('admin.confirmRejection')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('admin.rejectionConfirmMessage')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <label className="text-sm font-medium mb-2 block">{t('admin.rejectionReason')}</label>
                            <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder={t('admin.rejectionReasonPlaceholder')}
                                rows={3}
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setRejectionReason('')}>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                                {t('admin.reject')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}

export default AdminActions
