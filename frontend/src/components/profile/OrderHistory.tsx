
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Bike } from 'lucide-react';

// This would come from your database
const mockOrders = [
  {
    id: '1',
    date: '2025-05-01',
    status: 'processing',
    total: 1299.99,
    items: [{ title: 'Giant TCR 自行車', image: 'https://placehold.co/100x100' }],
    buyer: { name: '張三', email: 'chang@example.com' }
  },
  {
    id: '2',
    date: '2025-04-15',
    status: 'delivered',
    total: 899.50,
    items: [{ title: 'Trek 山地自行車', image: 'https://placehold.co/100x100' }],
    buyer: { name: '李四', email: 'li@example.com' }
  }
];

const mockSales = [
  {
    id: '3',
    date: '2025-05-03',
    status: 'shipped',
    total: 2199.99,
    items: [{ title: 'Specialized Allez 公路自行車', image: 'https://placehold.co/100x100' }],
    buyer: { name: '王五', email: 'wang@example.com' }
  }
];

const OrderHistory = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('orders');
  
  // Function to render the status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let color = '';
    let label = '';
    
    switch(status) {
      case 'processing':
        color = 'bg-blue-100 text-blue-800';
        label = t('orderProcessing');
        break;
      case 'shipped':
        color = 'bg-amber-100 text-amber-800';
        label = t('orderShipped');
        break;
      case 'delivered':
        color = 'bg-green-100 text-green-800';
        label = t('orderDelivered');
        break;
      case 'cancelled':
        color = 'bg-red-100 text-red-800';
        label = t('orderCancelled');
        break;
      default:
        color = 'bg-gray-100 text-gray-800';
        label = status;
    }
    
    return (
      <Badge className={`${color} border-0`}>{label}</Badge>
    );
  };
  
  // Orders table
  const OrdersTable = ({ orders }: { orders: any[] }) => {
    if (orders.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{t('youHaveNoOrders')}</h3>
          <Button className="mt-4" variant="outline" onClick={() => window.location.href = '/'}>
            {t('browseBicycles')}
          </Button>
        </div>
      );
    }
    
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('orderNumber')}</TableHead>
              <TableHead>{t('orderDate')}</TableHead>
              <TableHead>{t('orderStatus')}</TableHead>
              <TableHead>{t('orderTotal')}</TableHead>
              <TableHead>{t('orderDetails')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell>{renderStatusBadge(order.status)}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    {t('viewDetails')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  // Sales table
  const SalesTable = ({ sales }: { sales: any[] }) => {
    if (sales.length === 0) {
      return (
        <div className="text-center py-12">
          <Bike className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{t('youHaveNoSales')}</h3>
          <Button className="mt-4" variant="outline" onClick={() => window.location.href = '/upload'}>
            {t('publishNewBike')}
          </Button>
        </div>
      );
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
              <TableHead>{t('orderTotal')}</TableHead>
              <TableHead>{t('orderDetails')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>#{sale.id}</TableCell>
                <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                <TableCell>{renderStatusBadge(sale.status)}</TableCell>
                <TableCell>{sale.buyer.name}</TableCell>
                <TableCell>${sale.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    {t('viewDetails')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">{t('myOrders')}</TabsTrigger>
          <TabsTrigger value="sales">{t('mySales')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="mt-6">
          <OrdersTable orders={mockOrders} />
        </TabsContent>
        
        <TabsContent value="sales" className="mt-6">
          <SalesTable sales={mockSales} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderHistory;
