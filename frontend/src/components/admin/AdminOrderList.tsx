import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
    Loader2, 
    Search, 
    Eye, 
    Check, 
    X, 
    Clock, 
    FileImage, 
    Package, 
    CreditCard,
    AlertCircle,
    TrendingUp,
    ShoppingCart
} from 'lucide-react'
import { adminService, IAdminOrder, IAdminOrderStats } from '@/services/admin.service'
import { formatPriceNTD } from '@/utils/priceFormatter'
import PaymentProofReview from './PaymentProofReview'

interface OrderListState {
    orders: IAdminOrder[]
    stats: IAdminOrderStats | null
    isLoading: boolean
    error: string | null
    pagination: {
        page: number
        totalPages: number
        totalCount: number
    }
    filters: {
        paymentStatus: string
        status: string
        search: string
    }
}

const AdminOrderList: React.FC = () => {
    const { t, i18n } = useTranslation()
    const isChinese = i18n.language === 'zh'

    const [state, setState] = useState<OrderListState>({
        orders: [],
        stats: null,
        isLoading: true,
        error: null,
        pagination: {
            page: 1,
            totalPages: 1,
            totalCount: 0,
        },
        filters: {
            paymentStatus: 'all',
            status: 'all',
            search: '',
        },
    })

    const [selectedOrderForReview, setSelectedOrderForReview] = useState<IAdminOrder | null>(null)

    // 載入訂單統計
    const loadOrderStats = async () => {
        try {
            const stats = await adminService.getOrderStats()
            setState(prev => ({ ...prev, stats }))
        } catch (error) {
            console.error('Failed to load order stats:', error)
        }
    }

    // 載入訂單列表
    const loadOrders = async (page: number = 1) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }))

            const params = {
                page,
                limit: 20,
                ...(state.filters.paymentStatus !== 'all' && { paymentStatus: state.filters.paymentStatus }),
                ...(state.filters.status !== 'all' && { status: state.filters.status }),
                ...(state.filters.search && { search: state.filters.search }),
                sortBy: 'created_at',
                sortOrder: 'desc' as const,
            }

            const response = await adminService.getOrders(params)

            setState(prev => ({
                ...prev,
                orders: response.orders,
                pagination: {
                    page: response.meta.current_page || 1,
                    totalPages: response.meta.total_pages || 1,
                    totalCount: response.meta.total_count || 0,
                },
                isLoading: false,
            }))
        } catch (error) {
            console.error('Failed to load orders:', error)
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : '載入訂單失敗',
                isLoading: false,
            }))
        }
    }

    // 處理付款證明審核
    const handlePaymentProofReview = async (orderId: string, action: 'approve' | 'reject', notes?: string) => {
        try {
            if (action === 'approve') {
                await adminService.approvePaymentProof(orderId, notes)
            } else {
                await adminService.rejectPaymentProof(orderId, notes || '未提供理由', notes)
            }
            
            // 重新載入訂單和統計
            await Promise.all([loadOrders(state.pagination.page), loadOrderStats()])
            setSelectedOrderForReview(null)
        } catch (error) {
            console.error('Failed to review payment proof:', error)
        }
    }

    // 篩選選項
    const paymentStatusOptions = [
        { value: 'all', label: isChinese ? '全部付款狀態' : 'All Payment Status' },
        { value: 'pending', label: isChinese ? '待付款' : 'Pending Payment' },
        { value: 'awaiting_confirmation', label: isChinese ? '待確認' : 'Awaiting Confirmation' },
        { value: 'paid', label: isChinese ? '已付款' : 'Paid' },
        { value: 'failed', label: isChinese ? '付款失敗' : 'Payment Failed' },
        { value: 'refunded', label: isChinese ? '已退款' : 'Refunded' },
    ]

    const statusOptions = [
        { value: 'all', label: isChinese ? '全部訂單狀態' : 'All Order Status' },
        { value: 'pending', label: isChinese ? '待處理' : 'Pending' },
        { value: 'processing', label: isChinese ? '處理中' : 'Processing' },
        { value: 'shipped', label: isChinese ? '已出貨' : 'Shipped' },
        { value: 'delivered', label: isChinese ? '已送達' : 'Delivered' },
        { value: 'completed', label: isChinese ? '已完成' : 'Completed' },
        { value: 'cancelled', label: isChinese ? '已取消' : 'Cancelled' },
    ]

    useEffect(() => {
        loadOrderStats()
        loadOrders()
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            loadOrders(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [state.filters])

    // 渲染付款狀態徽章
    const renderPaymentStatusBadge = (paymentStatus: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: isChinese ? '待付款' : 'Pending' },
            awaiting_confirmation: { color: 'bg-blue-100 text-blue-800', label: isChinese ? '待確認' : 'Awaiting Confirmation' },
            paid: { color: 'bg-green-100 text-green-800', label: isChinese ? '已付款' : 'Paid' },
            failed: { color: 'bg-red-100 text-red-800', label: isChinese ? '失敗' : 'Failed' },
            refunded: { color: 'bg-gray-100 text-gray-800', label: isChinese ? '已退款' : 'Refunded' },
        }

        const config = statusConfig[paymentStatus as keyof typeof statusConfig] || statusConfig.pending
        return <Badge className={`${config.color} border-0`}>{config.label}</Badge>
    }

    // 渲染訂單狀態徽章
    const renderOrderStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: isChinese ? '待處理' : 'Pending' },
            processing: { color: 'bg-blue-100 text-blue-800', label: isChinese ? '處理中' : 'Processing' },
            shipped: { color: 'bg-purple-100 text-purple-800', label: isChinese ? '已出貨' : 'Shipped' },
            delivered: { color: 'bg-green-100 text-green-800', label: isChinese ? '已送達' : 'Delivered' },
            completed: { color: 'bg-emerald-100 text-emerald-800', label: isChinese ? '已完成' : 'Completed' },
            cancelled: { color: 'bg-red-100 text-red-800', label: isChinese ? '已取消' : 'Cancelled' },
        }

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
        return <Badge className={`${config.color} border-0`}>{config.label}</Badge>
    }

    // 渲染付款證明狀態
    const renderPaymentProofStatus = (order: IAdminOrder) => {
        const proofInfo = order.paymentProofInfo

        if (!proofInfo || !proofInfo.hasProof) {
            return (
                <div className="flex items-center gap-2 text-gray-500">
                    <X className="w-4 h-4" />
                    <span className="text-sm">{isChinese ? '無證明' : 'No Proof'}</span>
                </div>
            )
        }

        const statusConfig = {
            pending: {
                icon: <Clock className="w-4 h-4 text-blue-600" />,
                label: isChinese ? '待審核' : 'Pending Review',
                color: 'text-blue-600',
            },
            approved: {
                icon: <Check className="w-4 h-4 text-green-600" />,
                label: isChinese ? '已審核' : 'Approved',
                color: 'text-green-600',
            },
            rejected: {
                icon: <X className="w-4 h-4 text-red-600" />,
                label: isChinese ? '已拒絕' : 'Rejected',
                color: 'text-red-600',
            },
        }

        const config = statusConfig[proofInfo.status as keyof typeof statusConfig] || statusConfig.pending

        return (
            <div className={`flex items-center gap-2 ${config.color}`}>
                {config.icon}
                <span className="text-sm">{config.label}</span>
                {proofInfo.filename && (
                    <FileImage className="w-4 h-4 text-gray-400" />
                )}
            </div>
        )
    }

    // 渲染統計卡片
    const renderStatsCards = () => {
        if (!state.stats) return null

        const stats = [
            {
                title: isChinese ? '總訂單' : 'Total Orders',
                value: state.stats.total_orders,
                icon: <Package className="w-5 h-5 text-blue-600" />,
                color: 'bg-blue-50 border-blue-200',
            },
            {
                title: isChinese ? '待確認付款' : 'Awaiting Confirmation',
                value: state.stats.awaiting_confirmation,
                icon: <Clock className="w-5 h-5 text-orange-600" />,
                color: 'bg-orange-50 border-orange-200',
            },
            {
                title: isChinese ? '已付款' : 'Paid Orders',
                value: state.stats.paid_orders,
                icon: <Check className="w-5 h-5 text-green-600" />,
                color: 'bg-green-50 border-green-200',
            },
            {
                title: isChinese ? '待付款' : 'Pending Payment',
                value: state.stats.pending_payment,
                icon: <CreditCard className="w-5 h-5 text-yellow-600" />,
                color: 'bg-yellow-50 border-yellow-200',
            },
        ]

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <Card key={index} className={`${stat.color}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                                {stat.icon}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">{isChinese ? '訂單管理' : 'Order Management'}</h2>
                <p className="text-gray-500">{isChinese ? '管理訂單和付款證明審核' : 'Manage orders and payment proof reviews'}</p>
            </div>

            {renderStatsCards()}

            {/* 篩選器 */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{isChinese ? '篩選訂單' : 'Filter Orders'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder={isChinese ? '搜尋訂單編號或商品' : 'Search orders or products...'}
                                value={state.filters.search}
                                onChange={(e) => setState(prev => ({
                                    ...prev,
                                    filters: { ...prev.filters, search: e.target.value }
                                }))}
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={state.filters.paymentStatus}
                            onValueChange={(value) => setState(prev => ({
                                ...prev,
                                filters: { ...prev.filters, paymentStatus: value }
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentStatusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={state.filters.status}
                            onValueChange={(value) => setState(prev => ({
                                ...prev,
                                filters: { ...prev.filters, status: value }
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={() => setState(prev => ({
                                ...prev,
                                filters: { paymentStatus: 'all', status: 'all', search: '' }
                            }))}
                        >
                            {isChinese ? '清除篩選' : 'Clear Filters'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 訂單列表 */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{isChinese ? '訂單列表' : 'Order List'}</CardTitle>
                        <div className="text-sm text-gray-500">
                            {isChinese ? `共 ${state.pagination.totalCount} 筆訂單` : `${state.pagination.totalCount} total orders`}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {state.isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            <span>{isChinese ? '載入中...' : 'Loading...'}</span>
                        </div>
                    ) : state.error ? (
                        <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-red-600 mb-4">{state.error}</p>
                            <Button onClick={() => loadOrders()}>{isChinese ? '重試' : 'Retry'}</Button>
                        </div>
                    ) : state.orders.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">{isChinese ? '找不到訂單' : 'No orders found'}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{isChinese ? '訂單編號' : 'Order Number'}</TableHead>
                                        <TableHead>{isChinese ? '商品' : 'Product'}</TableHead>
                                        <TableHead>{isChinese ? '買家' : 'Buyer'}</TableHead>
                                        <TableHead>{isChinese ? '賣家' : 'Seller'}</TableHead>
                                        <TableHead>{isChinese ? '金額' : 'Amount'}</TableHead>
                                        <TableHead>{isChinese ? '付款狀態' : 'Payment Status'}</TableHead>
                                        <TableHead>{isChinese ? '訂單狀態' : 'Order Status'}</TableHead>
                                        <TableHead>{isChinese ? '付款證明' : 'Payment Proof'}</TableHead>
                                        <TableHead>{isChinese ? '建立時間' : 'Created'}</TableHead>
                                        <TableHead>{isChinese ? '操作' : 'Actions'}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {state.orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                <Link 
                                                    to={`/orders/${order.id}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    #{order.orderNumber || order.id}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {order.bicycle?.mainPhotoUrl && (
                                                        <img
                                                            src={order.bicycle.mainPhotoUrl}
                                                            alt={order.bicycle.title}
                                                            className="w-8 h-8 object-cover rounded"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{order.bicycle?.title || '未知商品'}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {order.bicycle?.brand} {order.bicycle?.model}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{order.buyer?.name}</p>
                                                    <p className="text-xs text-gray-500">{order.buyer?.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{order.seller?.name}</p>
                                                    <p className="text-xs text-gray-500">{order.seller?.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold text-green-600">
                                                {formatPriceNTD(order.totalPrice)}
                                            </TableCell>
                                            <TableCell>{renderPaymentStatusBadge(order.paymentStatus)}</TableCell>
                                            <TableCell>{renderOrderStatusBadge(order.status)}</TableCell>
                                            <TableCell>{renderPaymentProofStatus(order)}</TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString('zh-TW')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link to={`/orders/${order.id}`}>
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                    {order.paymentProofInfo?.hasProof && 
                                                     order.paymentProofInfo.status === 'pending' && (
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => setSelectedOrderForReview(order)}
                                                        >
                                                            {isChinese ? '審核' : 'Review'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 付款證明審核彈窗 */}
            {selectedOrderForReview && (
                <PaymentProofReview
                    order={selectedOrderForReview}
                    onApprove={(notes) => handlePaymentProofReview(selectedOrderForReview.id, 'approve', notes)}
                    onReject={(reason, notes) => handlePaymentProofReview(selectedOrderForReview.id, 'reject', notes)}
                    onClose={() => setSelectedOrderForReview(null)}
                />
            )}
        </div>
    )
}

export default AdminOrderList