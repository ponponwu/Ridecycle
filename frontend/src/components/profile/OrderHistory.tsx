import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom' // Import Link for navigation
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Bike, ExternalLink } from 'lucide-react' // Added ExternalLink
import { orderService } from '@/api' // Import orderService
import { IOrder, IOrderListResponse } from '@/types/order.types' // Import IOrder type

// Define a type for the mock sales data to satisfy ESLint for now
interface MockSaleItem {
    id: string
    date: string
    status: string
    total: number
    items: { title: string; image: string }[]
    buyer: { name: string; email: string }
}

const OrderHistory = () => {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('purchases')
    const [purchaseOrders, setPurchaseOrders] = useState<IOrder[]>([])
    const [salesOrders, setSalesOrders] = useState<IOrder[]>([])
    const [isLoadingOrders, setIsLoadingOrders] = useState(true)
    const [ordersError, setOrdersError] = useState<string | null>(null)

    // Fetch user's orders
    useEffect(() => {
        const fetchMyOrders = async () => {
            if (activeTab === 'orders') {
                // Only fetch if the 'orders' tab is active
                try {
                    setIsLoadingOrders(true)
                    console.log('Fetching purchase orders...')

                    // 使用新的 API 方法
                    const response = await orderService.getOrders({
                        type: 'purchases',
                        page: 1,
                        limit: 50,
                    })

                    console.log('Purchase orders response:', response)

                    // 處理回應數據
                    const orders = response?.orders || []
                    setMyOrders(Array.isArray(orders) ? orders : [])
                    setOrdersError(null)
                } catch (err) {
                    console.error('Failed to fetch my orders:', err)
                    if (err instanceof Error) {
                        setOrdersError(err.message)
                    } else {
                        setOrdersError('An unknown error occurred while fetching orders.')
                    }
                } finally {
                    setIsLoadingOrders(false)
                }
            }
        }

        fetchMyOrders()
    }, [activeTab]) // Re-fetch if activeTab changes to 'orders'

    // Function to render the status badge with appropriate color
    const renderStatusBadge = (status: string) => {
        let color = ''
        let label = ''

        switch (status) {
            case 'processing':
                color = 'bg-blue-100 text-blue-800'
                label = t('orderStatus.processing')
                break
            case 'shipped':
                color = 'bg-amber-100 text-amber-800'
                label = t('orderStatus.shipped')
                break
            case 'delivered':
                color = 'bg-green-100 text-green-800'
                label = t('orderStatus.delivered')
                break
            case 'completed': // Added completed status
                color = 'bg-green-100 text-green-800'
                label = t('orderStatus.completed')
                break
            case 'cancelled':
                color = 'bg-red-100 text-red-800'
                label = t('orderStatus.cancelled')
                break
            case 'pending': // Added pending status
                color = 'bg-yellow-100 text-yellow-800'
                label = t('orderStatus.pending')
                break
            default:
                color = 'bg-gray-100 text-gray-800'
                label = t(`orderStatus.${status}`, status) // Attempt to translate, fallback to status string
        }

        return <Badge className={`${color} border-0`}>{label}</Badge>
    }

    // Orders table
    const OrdersTable = ({ orders }: { orders: IOrder[] }) => {
        // Use IOrder type
        if (isLoadingOrders) {
            return <div className="text-center py-12">{t('loadingOrders')}...</div>
        }
        if (ordersError) {
            return <div className="text-center py-12 text-red-500">Error: {ordersError}</div>
        }
        if (orders.length === 0) {
            return (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">{t('youHaveNoOrders')}</h3>
                    <Button className="mt-4" variant="outline" onClick={() => (window.location.href = '/')}>
                        {t('browseBicycles')}
                    </Button>
                </div>
            )
        }

        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">{t('orderNumber')}</TableHead>
                            <TableHead>{t('item')}</TableHead>
                            <TableHead>{t('orderDate')}</TableHead>
                            <TableHead>{t('orderStatus')}</TableHead>
                            <TableHead className="text-right">{t('orderTotal')}</TableHead>
                            <TableHead className="text-right">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.orderNumber || order.id}</TableCell>
                                <TableCell>
                                    {order.bicycle ? (
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={
                                                    order.bicycle.photosUrls && order.bicycle.photosUrls.length > 0
                                                        ? order.bicycle.photosUrls[0]
                                                        : '/placeholder.svg'
                                                }
                                                alt={order.bicycle.title}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                            <Link to={`/bicycle/${order.bicycle.id}`} className="hover:underline">
                                                {order.bicycle.title}
                                            </Link>
                                        </div>
                                    ) : (
                                        t('itemNotAvailable')
                                    )}
                                </TableCell>
                                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>{renderStatusBadge(order.status)}</TableCell>
                                <TableCell className="text-right">${order.total?.toFixed(2) || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <Link to={`/orders/${order.orderNumber || order.id}`}>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      {t('viewDetails')}
                    </Button>
                  </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    // Sales table (remains with mock data for now)
    const mockSales: MockSaleItem[] = [
        // Use the defined type
        {
            id: '3',
            date: '2025-05-03',
            status: 'shipped',
            total: 2199.99,
            items: [{ title: 'Specialized Allez 公路自行車', image: 'https://placehold.co/100x100' }],
            buyer: { name: '王五', email: 'wang@example.com' },
        },
    ]
    const SalesTable = ({ sales }: { sales: MockSaleItem[] }) => {
        // Use the defined type
        if (sales.length === 0) {
            return (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                    <Bike className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">{t('youHaveNoSales')}</h3>
                    <Button className="mt-4" variant="outline" onClick={() => (window.location.href = '/upload')}>
                        {t('publishNewBike')}
                    </Button>
                </div>
            )
        }

        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('orderNumber')}</TableHead>
                            <TableHead>{t('orderDate')}</TableHead>
                            <TableHead>{t('orderStatus')}</TableHead>
                            <TableHead>{t('buyerInformation')}</TableHead>
                            <TableHead className="text-right">{t('orderTotal')}</TableHead>
                            <TableHead className="text-right">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.map((sale) => (
                            <TableRow key={sale.id}>
                                <TableCell>#{sale.id}</TableCell>
                                <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                                <TableCell>{renderStatusBadge(sale.status)}</TableCell>
                                <TableCell>{sale.buyer.name}</TableCell>
                                <TableCell className="text-right">${sale.total.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        {t('viewDetails')} <ExternalLink className="ml-1 h-3 w-3" />
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
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="orders">{t('myOrders')}</TabsTrigger>
                    <TabsTrigger value="sales">{t('mySales')}</TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="mt-6">
                    <OrdersTable orders={myOrders} />
                </TabsContent>

                <TabsContent value="sales" className="mt-6">
                    <SalesTable sales={mockSales} /> {/* Sales still uses mock data */}
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default OrderHistory
