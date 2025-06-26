import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ArrowLeft, Package, MapPin, CreditCard, Truck, Check, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { orderService } from '@/api/services/order.service';
import { IOrder } from '@/types/order.types';
import { extractData } from '@/api/client';
import { formatPriceNTD } from '@/utils/priceFormatter';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderNumber) {
      loadOrder(orderNumber);
    }
  }, [orderNumber]);

  const loadOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await orderService.getOrderById(orderId);
      const orderData = extractData(response) as IOrder;
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order:', error);
      setError(error instanceof Error ? error.message : '載入訂單失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    let color = '';
    let label = '';

    switch(status) {
      case 'pending':
        color = 'bg-yellow-100 text-yellow-800';
        label = t('orders.status.pending');
        break;
      case 'processing':
        color = 'bg-blue-100 text-blue-800';
        label = t('orders.status.processing');
        break;
      case 'shipped':
        color = 'bg-purple-100 text-purple-800';
        label = t('orders.status.shipped');
        break;
      case 'delivered':
        color = 'bg-green-100 text-green-800';
        label = t('orders.status.delivered');
        break;
      case 'completed':
          color = 'bg-emerald-100 text-emerald-800';
          label = t('orders.status.completed');
          break;
      case 'cancelled':
        color = 'bg-red-100 text-red-800';
        label = t('orders.status.cancelled');
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
        label = status;
    }

    return (
      <Badge className={`${color} border-0`}>{label}</Badge>
    );
  };

  const getProgressSteps = (status: string) => {
    const steps = [
      { key: 'processing', label: '處理中', icon: Package },
      { key: 'shipped', label: '已出貨', icon: Truck },
      { key: 'delivered', label: '已送達', icon: Check }
    ];

    const statusOrder = ['processing', 'shipped', 'delivered', 'completed'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      isCompleted: index <= currentIndex,
      isCurrent: index === currentIndex && status !== 'completed'
    }));
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    );
  }

  if (error || !order) {
    return (
      <MainLayout>
        <div className="container max-w-4xl px-4 py-16 mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h1 className="mb-4 text-2xl font-bold">無法載入訂單</h1>
          <p className="mb-8 text-gray-600">{error || '找不到您要查看的訂單資訊。'}</p>
          <Button onClick={() => navigate('/profile')}>
            返回個人資料
          </Button>
        </div>
      </MainLayout>
    );
  }

  const progressSteps = getProgressSteps(order.status);

  return (
    <MainLayout>
      <div className="container max-w-6xl px-4 py-8 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold">訂單詳情</h1>
              <p className="text-gray-600">訂單編號: #{order.orderNumber || order.id}</p>
            </div>
          </div>
          {renderStatusBadge(order.status)}
        </div>

        {/* Order Progress */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">訂單進度</h2>
          <div className="flex items-center justify-between relative">
            {progressSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center flex-1 z-10">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                      step.isCompleted
                        ? 'bg-green-600 text-white'
                        : step.isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className={`mt-2 text-sm text-center ${
                      step.isCompleted || step.isCurrent ? 'text-gray-900 font-medium' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {index < progressSteps.length - 1 && (
                     <div className={`absolute top-6 left-0 w-full h-0.5 ${
                        progressSteps[index].isCompleted ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                訂購商品
              </h2>
              {order.bicycle && (
                <div className="flex items-center space-x-4 p-4 border rounded-md">
                  <img
                    src={order.bicycle.mainPhotoUrl}
                    alt={order.bicycle.title}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{order.bicycle.title}</h3>
                    <p className="text-gray-600">{order.bicycle.brand} {order.bicycle.model}</p>
                    <p className="text-sm text-gray-500">狀況: {order.bicycle.condition}</p>
                    <p className="text-xl font-bold text-blue-600 mt-2">{formatPriceNTD(order.totalPrice)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">訂單摘要</h2>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">商品價格</TableCell>
                    <TableCell className="text-right">{formatPriceNTD(order.subtotal || order.totalPrice)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">運費</TableCell>
                    <TableCell className="text-right">{formatPriceNTD(order.shippingCost)}</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold text-lg">總計</TableCell>
                    <TableCell className="font-bold text-lg text-blue-600 text-right">{formatPriceNTD(order.totalPrice)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Right Column - Addresses & Payment */}
          <div className="space-y-6">
            {/* Order Details */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">訂單資訊</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">訂單日期:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('zh-TW')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">訂單狀態:</span>
                  <span>{renderStatusBadge(order.status)}</span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            {order.seller && (
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  賣家資訊
                </h2>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.seller.fullName || order.seller.name}</p>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                付款方式
              </h2>
              <div className="text-sm space-y-1">
                <p>付款方式: {t(`orders.paymentMethods.${order.paymentMethod}`)}</p>
                <p>付款狀態: {t(`orders.paymentStatus.${order.paymentStatus}`)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button variant="outline" size="sm" className="w-full">
                下載收據
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                聯絡客服
              </Button>
              {order.status === 'delivered' && (
                <Button size="sm" className="w-full">
                  評價商品
                </Button>
              )}
              {order.status === 'pending' && !order.expired && (
                 <Button asChild size="sm" className="w-full">
                    <a href={`/orders/${order.id}/payment`}>前往付款</a>
                 </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderDetail;
