import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, Link } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ShoppingCart, Package, Calendar, CreditCard, Truck, AlertCircle } from 'lucide-react'
import { orderService } from '@/api/services/order.service'
import { IOrder } from '@/types/order.types'

interface OrderListState {
    purchaseOrders: IOrder[]
    salesOrders: IOrder[]
    isLoading: boolean
    error: string | null
    pagination: {
        purchases: { page: number; totalPages: number; totalCount: number }
        sales: { page: number; totalPages: number; totalCount: number }
    }
}

const OrderList: React.FC = () => {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const activeTab = searchParams.get('tab') || 'purchases'
    const statusFilter = searchParams.get('status') || 'all'

    const [state, setState] = useState<OrderListState>({
        purchaseOrders: [],
        salesOrders: [],
        isLoading: true,
        error: null,
        pagination: {
            purchases: { page: 1, totalPages: 1, totalCount: 0 },
            sales: { page: 1, totalPages: 1, totalCount: 0 },
        },
    })

    const statusOptions = [
        { value: 'all', label: t('orders.allStatus') },
        { value: 'pending', label: t('orders.pending') },
        { value: 'processing', label: t('orders.processing') },
        { value: 'shipped', label: t('orders.shipped') },
        { value: 'delivered', label: t('orders.delivered') },
        { value: 'completed', label: t('orders.completed') },
        { value: 'cancelled', label: t('orders.cancelled') },
    ]

    const loadOrders = async (type: 'purchases' | 'sales', page: number = 1) => {
        try {
            setState((prev) => ({ ...prev, isLoading: true, error: null }))

            const params = {
                page,
                per_page: 10,
                ...(statusFilter !== 'all' && { status: statusFilter }),
            }

            let response
            if (type === 'purchases') {
                response = await orderService.getPurchaseOrders(params)
            } else {
                response = await orderService.getSalesOrders(params)
            }

            // 處理 JSON:API 格式回應
            const orders = Array.isArray(response.data) ? response.data : [response.data].filter(Boolean)
            const meta = response.meta || {}

            setState((prev) => ({
                ...prev,
                [`${type}Orders`]: orders,
                pagination: {
                    ...prev.pagination,
                    [type]: {
                        page: meta.current_page || 1,
                        totalPages: meta.total_pages || 1,
                        totalCount: meta.total_count || 0,
                    },
                },
                isLoading: false,
            }))
        } catch (error) {
            console.error(`Failed to load ${type} orders:`, error)
            setState((prev) => ({
                ...prev,
                error: error instanceof Error ? error.message : `載入${type === 'purchases' ? '購買' : '銷售'}訂單失敗`,
                isLoading: false,
            }))
        }
    }

    useEffect(() => {
        loadOrders(activeTab as 'purchases' | 'sales')
    }, [activeTab, statusFilter])

    const handleTabChange = (tab: string) => {
        setSearchParams({ tab, ...(statusFilter !== 'all' && { status: statusFilter }) })
    }

    const handleStatusChange = (status: string) => {
        setSearchParams({ tab: activeTab, ...(status !== 'all' && { status }) })
    }

    const getStatusBadge = (status: string, paymentStatus: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: t('pending') },
            processing: { color: 'bg-blue-100 text-blue-800', label: t('processing') },
            shipped: { color: 'bg-purple-100 text-purple-800', label: t('shipped') },
            delivered: { color: 'bg-green-100 text-green-800', label: t('delivered') },
            completed: { color: 'bg-green-100 text-green-800', label: t('completed') },
            cancelled: { color: 'bg-red-100 text-red-800', label: t('cancelled') },
        }

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

        return (
            <div className="flex gap-2">
                <Badge className={config.color}>{config.label}</Badge>
                {paymentStatus === 'pending' && status === 'pending' && (
                    <Badge className="bg-orange-100 text-orange-800">{t('awaitingPayment')}</Badge>
                )}
            </div>
        )
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0,
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const renderOrderCard = (order: IOrder, type: 'purchases' | 'sales') => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">
                            <Link to={`/orders/${order.id}`} className="hover:text-blue-600 transition-colors">
                                {order.bicycle?.title || '未知商品'}
                            </Link>
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('orderNumber')}: {order.orderNumber}
                        </p>
                    </div>
                    {getStatusBadge(order.status, order.paymentStatus)}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">{formatPrice(order.total)}</span>
                    <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        {type === 'purchases' ? (
                            <>
                                <Package className="w-4 h-4 text-gray-400" />
                                <span>
                                    {t('seller')}: {order.seller?.fullName || '未知'}
                                </span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-4 h-4 text-gray-400" />
                                <span>
                                    {t('buyer')}: {order.buyer?.name || '未知'}
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span>{order.shipping_method === 'self_pickup' ? t('selfPickup') : t('delivery')}</span>
                    </div>
                </div>

                {order.payment_status === 'pending' && order.status === 'pending' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-orange-800">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {order.remaining_payment_time_humanized || t('paymentRequired')}
                            </span>
                        </div>
                        {order.expired && <p className="text-xs text-red-600 mt-1">{t('orderExpired')}</p>}
                    </div>
                )}

                <div className="flex gap-2 pt-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link to={`/orders/${order.id}`}>{t('viewDetails')}</Link>
                    </Button>

                    {order.status === 'pending' &&
                        order.payment_status === 'pending' &&
                        type === 'purchases' &&
                        !order.expired && (
                            <Button asChild size="sm" className="flex-1">
                                <Link to={`/orders/${order.id}/payment`}>{t('payNow')}</Link>
                            </Button>
                        )}
                </div>
            </CardContent>
        </Card>
    )

    const renderOrders = (orders: IOrder[], type: 'purchases' | 'sales') => {
        if (state.isLoading) {
            return (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="ml-2">{t('loading')}</span>
                </div>
            )
        }

        if (state.error) {
            return (
                <div className="text-center py-12">
                    <div className="text-red-500 mb-4">{state.error}</div>
                    <Button onClick={() => loadOrders(type)}>{t('tryAgain')}</Button>
                </div>
            )
        }

        if (orders.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                        {type === 'purchases' ? t('noPurchaseOrders') : t('noSalesOrders')}
                    </div>
                    <Button asChild variant="outline">
                        <Link to="/bicycles">{type === 'purchases' ? t('startShopping') : t('sellBicycle')}</Link>
                    </Button>
                </div>
            )
        }

        return <div className="space-y-4">{orders.map((order) => renderOrderCard(order, type))}</div>
    }

    return (
        <MainLayout>
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">{t('myOrders')}</h1>
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder={t('filterByStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="purchases" className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            {t('purchases')} ({state.pagination.purchases.totalCount})
                        </TabsTrigger>
                        <TabsTrigger value="sales" className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            {t('sales')} ({state.pagination.sales.totalCount})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="purchases" className="mt-6">
                        {renderOrders(state.purchaseOrders, 'purchases')}
                    </TabsContent>

                    <TabsContent value="sales" className="mt-6">
                        {renderOrders(state.salesOrders, 'sales')}
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}

export default OrderList
