import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, ExternalLink } from 'lucide-react'
import { orderService } from '@/api/services/order.service'
import { extractData } from '@/api/client'
import { IOrder } from '@/types/order.types'
import { formatPriceNTD } from '@/utils/priceFormatter'

const OrderHistoryFixed = () => {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('purchases')
    const [purchaseOrders, setPurchaseOrders] = useState<IOrder[]>([])
    const [salesOrders, setSalesOrders] = useState<IOrder[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadOrders = async (type: 'purchases' | 'sales') => {
        try {
            setIsLoading(true)
            setError(null)

            console.log(`Loading ${type} orders...`)

            const response = await orderService.getOrders({
                type,
                page: 1,
                limit: 50,
            })

            console.log(`${type} response:`, response)

            // 提取資料並確保是陣列
            let orders: IOrder[] = []
            if (response) {
                // 處理不同的回應格式
                if ('orders' in response && Array.isArray(response.orders)) {
                    orders = response.orders
                } else if ('data' in response) {
                    const extractedData = extractData(response)
                    orders = Array.isArray(extractedData) ? extractedData : [extractedData]
                } else if (Array.isArray(response)) {
                    orders = response
                }
            }

            console.log(`Processed ${type} orders:`, orders)

            if (type === 'purchases') {
                setPurchaseOrders(orders)
            } else {
                setSalesOrders(orders)
            }
        } catch (err) {
            console.error(`Failed to load ${type} orders:`, err)
            setError(`載入${type === 'purchases' ? '購買' : '銷售'}訂單失敗`)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadOrders(activeTab as 'purchases' | 'sales')
    }, [activeTab])

    const renderStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', label: t('orders.status.pending', '待付款') },
            processing: { color: 'bg-blue-100 text-blue-800', label: t('orders.status.processing', '處理中') },
            shipped: { color: 'bg-purple-100 text-purple-800', label: t('orders.status.shipped', '已出貨') },
            delivered: { color: 'bg-green-100 text-green-800', label: t('orders.status.delivered', '已送達') },
            completed: { color: 'bg-green-100 text-green-800', label: t('orders.status.completed', '已完成') },
            cancelled: { color: 'bg-red-100 text-red-800', label: t('orders.status.cancelled', '已取消') },
        }

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
        return <Badge className={`${config.color} border-0`}>{config.label}</Badge>
    }

    const formatPrice = (price: number | undefined) => {
        console.log('formatPrice called with:', price, 'type:', typeof price)
        if (typeof price !== 'number' || isNaN(price)) {
            return 'N/A'
        }
        return formatPriceNTD(price)
    }

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A'
        try {
            return new Date(dateString).toLocaleDateString('zh-TW')
        } catch {
            return 'N/A'
        }
    }

    const OrdersTable = ({ orders, type }: { orders: IOrder[]; type: 'purchases' | 'sales' }) => {
        if (isLoading) {
            return <div className="text-center py-12">載入中...</div>
        }

        if (error) {
            return (
                <div className="text-center py-12">
                    <div className="text-red-500 mb-4">{error}</div>
                    <Button onClick={() => loadOrders(type)}>重試</Button>
                </div>
            )
        }

        if (orders.length === 0) {
            return (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        {type === 'purchases' ? '您還沒有購買訂單' : '您還沒有銷售訂單'}
                    </h3>
                    <Button className="mt-4" variant="outline" asChild>
                        <Link to={type === 'purchases' ? '/search' : '/upload'}>
                            {type === 'purchases' ? '開始購物' : '出售自行車'}
                        </Link>
                    </Button>
                </div>
            )
        }

        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>訂單編號</TableHead>
                            <TableHead>商品</TableHead>
                            <TableHead>日期</TableHead>
                            <TableHead>狀態</TableHead>
                            <TableHead className="text-right">金額</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.orderNumber || order.id}</TableCell>
                                <TableCell>
                                    {order.bicycle ? (
                                        <div className="flex items-center space-x-3">
                                            {order.bicycle.mainPhotoUrl && (
                                                <img
                                                    src={order.bicycle.mainPhotoUrl}
                                                    alt={order.bicycle.title}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            )}
                                            <div>
                                                <Link
                                                    to={`/bicycle/${order.bicycle.id}`}
                                                    className="hover:underline font-medium"
                                                >
                                                    {order.bicycle.title}
                                                </Link>
                                                <div className="text-sm text-gray-500">
                                                    {order.bicycle.brand} {order.bicycle.model}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        '商品不可用'
                                    )}
                                </TableCell>
                                <TableCell>{formatDate(order.createdAt)}</TableCell>
                                <TableCell>{renderStatusBadge(order.status)}</TableCell>
                                <TableCell className="text-right">
                                    {(() => {
                                        console.log('Order data for price:', {
                                            id: order.id,
                                            totalPrice: order.totalPrice,
                                            totalPriceType: typeof order.totalPrice,
                                            fullOrder: order,
                                        })
                                        return formatPrice(order.totalPrice)
                                    })()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link to={`/orders/${order.orderNumber || order.id}`}>
                                            查看詳情 <ExternalLink className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="purchases">購買記錄 ({purchaseOrders.length})</TabsTrigger>
                    <TabsTrigger value="sales">銷售記錄 ({salesOrders.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="purchases" className="mt-6">
                    <OrdersTable orders={purchaseOrders} type="purchases" />
                </TabsContent>

                <TabsContent value="sales" className="mt-6">
                    <OrdersTable orders={salesOrders} type="sales" />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default OrderHistoryFixed
