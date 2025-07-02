import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Copy, Check, CreditCard, Building2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { RIDE_CYCLE_BANK_INFO, BANK_FIELD_TRANSLATION_KEYS } from '@/constants/bankInfo'
import { formatPriceNTD } from '@/utils/priceFormatter'
import type { BankInfoDisplayMode, CopyableField } from '@/types/payment.types'

interface BankAccountInfoProps {
    /**
     * 訂單總金額
     */
    amount?: number
    /**
     * 轉帳備註（通常是訂單編號）
     */
    transferNote?: string
    /**
     * 顯示模式
     */
    mode?: BankInfoDisplayMode
    /**
     * 自定義標題
     */
    title?: string
    /**
     * 是否顯示卡片容器
     */
    showCard?: boolean
    /**
     * 額外的樣式類名
     */
    className?: string
}

const BankAccountInfo: React.FC<BankAccountInfoProps> = (props) => {
    const { amount, transferNote, title, showCard = true, className = '' } = props
    const mode: BankInfoDisplayMode = props.mode ?? 'full'
    const { t } = useTranslation()
    const { toast } = useToast()
    const [copiedField, setCopiedField] = useState<CopyableField | null>(null)

    const copyToClipboard = async (text: string, field: CopyableField) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedField(field)
            toast({
                title: t('copySuccess', '已複製'),
                description: t('copySuccessDesc', '已複製到剪貼板'),
            })
            setTimeout(() => setCopiedField(null), 2000)
        } catch (error) {
            toast({
                title: t('copyFailed', '複製失敗'),
                description: t('copyFailedDesc', '無法複製到剪貼板'),
                variant: 'destructive',
            })
        }
    }

    const CopyButton: React.FC<{ text: string; field: CopyableField; disabled?: boolean }> = ({
        text,
        field,
        disabled = false,
    }) => (
        <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(text, field)}
            disabled={disabled}
            className="h-8 w-8 p-0"
        >
            {copiedField === field ? (
                <Check className="w-4 h-4 text-green-600" />
            ) : (
                <Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            )}
        </Button>
    )

    const BankInfoRow: React.FC<{
        label: string
        value: string
        copyable?: boolean
        field?: CopyableField
        highlighted?: boolean
    }> = ({ label, value, copyable = false, field, highlighted = false }) => (
        <div className={`flex justify-between items-center py-2 ${highlighted ? 'bg-blue-50 px-3 rounded-lg' : ''}`}>
            <span className={`text-sm ${highlighted ? 'font-medium text-blue-900' : 'text-gray-600'}`}>{label}</span>
            <div className="flex items-center gap-2">
                <span className={`font-medium text-right ${highlighted ? 'text-blue-900 text-lg' : ''}`}>{value}</span>
                {copyable && field && <CopyButton text={value} field={field} />}
            </div>
        </div>
    )

    const content = (
        <div className={`space-y-3 ${className}`}>
            {/* 基本銀行資訊 */}
            <div className="space-y-1">
                <BankInfoRow
                    label={t(BANK_FIELD_TRANSLATION_KEYS.bankName)}
                    value={RIDE_CYCLE_BANK_INFO.bankName}
                    copyable={mode !== 'readonly'}
                    field="bankName"
                />

                {mode === 'full' && (
                    <BankInfoRow
                        label={t(BANK_FIELD_TRANSLATION_KEYS.bankCode)}
                        value={RIDE_CYCLE_BANK_INFO.bankCode}
                        copyable={mode !== 'readonly'}
                        field="bankCode"
                    />
                )}

                <BankInfoRow
                    label={t(BANK_FIELD_TRANSLATION_KEYS.accountNumber)}
                    value={RIDE_CYCLE_BANK_INFO.accountNumber}
                    copyable={mode !== 'readonly'}
                    field="accountNumber"
                />

                <BankInfoRow
                    label={t(BANK_FIELD_TRANSLATION_KEYS.accountName)}
                    value={RIDE_CYCLE_BANK_INFO.accountName}
                    copyable={mode !== 'readonly'}
                    field="accountName"
                />

                {mode === 'full' && (
                    <BankInfoRow label={t(BANK_FIELD_TRANSLATION_KEYS.branch)} value={RIDE_CYCLE_BANK_INFO.branch} />
                )}
            </div>

            {/* 分隔線和金額資訊 */}
            {amount && (
                <>
                    <Separator />
                    <BankInfoRow
                        label={t(BANK_FIELD_TRANSLATION_KEYS.transferAmount)}
                        value={formatPriceNTD(amount)}
                        copyable={mode !== 'readonly'}
                        field="amount"
                        highlighted={true}
                    />
                </>
            )}

            {/* 轉帳備註 */}
            {transferNote && (
                <>
                    {!amount && <Separator />}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <BankInfoRow
                            label={t(BANK_FIELD_TRANSLATION_KEYS.transferNote)}
                            value={transferNote}
                            copyable={mode !== 'readonly'}
                            field="transferNote"
                        />
                    </div>
                </>
            )}

            {/* 重要提醒 */}
            {mode === 'full' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
                    <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-orange-800">
                            <p className="font-medium mb-1">轉帳注意事項</p>
                            <ul className="text-xs space-y-1 text-orange-700">
                                <li>• 請確認轉帳金額與訂單金額完全相符</li>
                                <li>• 轉帳備註請填入訂單編號以便快速核對</li>
                                <li>• 完成轉帳後請上傳轉帳證明</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    if (!showCard) {
        return content
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    {title || t('bankTransferInfo', '銀行轉帳資訊')}
                </CardTitle>
            </CardHeader>
            <CardContent>{content}</CardContent>
        </Card>
    )
}

export default BankAccountInfo
