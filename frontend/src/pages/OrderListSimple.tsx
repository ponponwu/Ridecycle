import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { orderService } from '@/api/services/order.service'

const OrderListSimple: React.FC = () => {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const activeTab = searchParams.get('tab') || 'purchases'

    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
    const [salesOrders, setSalesOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadOrders = async (type: 'purchases' | 'sales') => {
        try {
            setIsLoading(true)
            setError(null)

            console.log(`Loading ${type} orders...`)

            let response
            if (type === 'purchases') {
                response = await orderService.getOrders({ type: 'purchases', page: 1, per_page: 10 })
            } else {
                response = await orderService.getOrders({ type: 'sales', page: 1, per_page: 10 })
            }

            console.log(`${type} response:`, response)

            // 處理回應數據
            const orders = response?.data || []

            if (type === 'purchases') {
                setPurchaseOrders(Array.isArray(orders) ? orders : [])
            } else {
                setSalesOrders(Array.isArray(orders) ? orders : [])
            }
        } catch (error) {
            console.error(`Failed to load ${type} orders:`, error)
            setError(`載入${type === 'purchases' ? '購買' : '銷售'}訂單失敗: ${error}`)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadOrders(activeTab as 'purchases' | 'sales')
    }, [activeTab])

    const handleTabChange = (tab: string) => {
        setSearchParams({ tab })
    }

    const renderOrders = (orders: any[], type: 'purchases' | 'sales') => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="ml-2">載入中...</span>
                </div>
            )
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
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">{type === 'purchases' ? '暫無購買訂單' : '暫無銷售訂單'}</div>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                {orders.map((order, index) => (
                    <Card key={order.id || index} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>訂單 #{order.id || order.order_number || 'Unknown'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {JSON.stringify(order, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <MainLayout>
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">訂單測試頁面</h1>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="purchases">購買記錄 ({purchaseOrders.length})</TabsTrigger>
                        <TabsTrigger value="sales">銷售記錄 ({salesOrders.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="purchases" className="mt-6">
                        {renderOrders(purchaseOrders, 'purchases')}
                    </TabsContent>

                    <TabsContent value="sales" className="mt-6">
                        {renderOrders(salesOrders, 'sales')}
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}

export default OrderListSimple
