import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Check, X, Eye } from 'lucide-react'
import { BicycleWithOwner } from '@/types/bicycle.types'
import { useStatusBadge } from '../utils/statusUtils'
import { formatPriceNTD } from '@/utils/priceFormatter'

interface BicycleTableProps {
    bicycles: BicycleWithOwner[]
    onApprove: (id: string) => void
    onReject: (id: string) => void
}

const BicycleTable: React.FC<BicycleTableProps> = ({ bicycles, onApprove, onReject }) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { renderStatusBadge } = useStatusBadge()

    if (bicycles.length === 0) return null

    return (
        <div className="bg-white rounded-lg border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('admin.bicycleTitle')}</TableHead>
                        <TableHead>{t('seller')}</TableHead>
                        <TableHead>{t('admin.price')}</TableHead>
                        <TableHead>{t('admin.status')}</TableHead>
                        <TableHead>{t('admin.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bicycles.map((bicycle) => {
                        // 統一使用 seller 物件
                        const seller = bicycle.seller

                        return (
                            <TableRow key={bicycle.id}>
                                <TableCell className="font-medium">{bicycle.title}</TableCell>
                                <TableCell>{seller?.full_name || seller?.name || t('admin.unknownUser')}</TableCell>
                                <TableCell>{formatPriceNTD(bicycle.price)}</TableCell>
                                <TableCell>{renderStatusBadge(bicycle.status)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/admin/bicycles/${bicycle.id}`)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            {t('admin.viewDetails')}
                                        </Button>

                                        {bicycle.status === 'pending' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                    onClick={() => onApprove(bicycle.id)}
                                                >
                                                    <Check className="h-4 w-4 mr-1" />
                                                    {t('admin.approve')}
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                    onClick={() => onReject(bicycle.id)}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    {t('admin.reject')}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

export default BicycleTable
