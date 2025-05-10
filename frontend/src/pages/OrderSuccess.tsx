
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Check, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderSuccess = () => {
  const location = useLocation();
  const { orderId, bicycle } = location.state || {};
  
  if (!orderId) {
    // If there's no order ID, redirect to home
    return (
      <MainLayout>
        <div className="container max-w-4xl px-4 py-16 mx-auto text-center">
          <h1 className="mb-4 text-2xl font-bold">No Order Information Found</h1>
          <p className="mb-8">We couldn't find your order information. Please check your orders in your account.</p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl px-4 py-16 mx-auto">
        <div className="p-8 text-center bg-white rounded-lg shadow-md">
          <div className="flex justify-center mb-8">
            <div className="flex items-center justify-center w-20 h-20 text-white bg-green-600 rounded-full">
              <Check className="w-10 h-10" />
            </div>
          </div>
          
          <h1 className="mb-2 text-3xl font-bold text-green-600">Order Successful!</h1>
          <p className="mb-6 text-gray-600">Thank you for your purchase. Your order has been received.</p>
          
          <div className="p-4 mb-6 text-left border border-gray-200 rounded-md">
            <div className="mb-4">
              <span className="font-medium text-gray-500">Order ID:</span>
              <span className="ml-2 font-semibold">{orderId}</span>
            </div>
            {bicycle && (
              <div className="flex items-center gap-4">
                {bicycle.images && bicycle.images[0] && (
                  <img 
                    src={bicycle.images[0]} 
                    alt={bicycle.title} 
                    className="object-cover w-20 h-20 rounded"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{bicycle.title}</h3>
                  <p className="text-sm text-gray-600">{bicycle.brand} {bicycle.model}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2">
            <div className="flex items-center p-4 bg-gray-50 rounded-md">
              <Package className="mr-4 text-blue-600" />
              <div>
                <h3 className="font-semibold">Preparing Your Order</h3>
                <p className="text-sm text-gray-600">We're getting your order ready for shipment.</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-md">
              <Truck className="mr-4 text-blue-600" />
              <div>
                <h3 className="font-semibold">Shipping Information</h3>
                <p className="text-sm text-gray-600">You'll receive tracking information by email.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/profile">View Order History</Link>
            </Button>
            <Button asChild>
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderSuccess;
