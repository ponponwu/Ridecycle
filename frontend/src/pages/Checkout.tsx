
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import ShippingAddressForm from '@/components/checkout/ShippingAddressForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import CheckoutConfirmation from '@/components/checkout/CheckoutConfirmation';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bicycle } = location.state || {};
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({});
  const [paymentInfo, setPaymentInfo] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // If no bicycle data is passed, redirect to home
  React.useEffect(() => {
    if (!bicycle) {
      navigate('/');
    }
  }, [bicycle, navigate]);

  const steps = ['Shipping Address', 'Payment', 'Confirmation'];

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleShippingSubmit = (data) => {
    setShippingInfo(data);
    handleNextStep();
  };

  const handlePaymentSubmit = (data) => {
    setPaymentInfo(data);
    handleNextStep();
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, this would be an API call to process the order
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Show success message
      navigate('/order-success', { 
        state: { 
          orderId: `ORD-${Date.now().toString().slice(-8)}`,
          bicycle,
          shippingInfo,
          paymentInfo 
        } 
      });
    } catch (error) {
      console.error('Order submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bicycle) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="container max-w-6xl px-4 py-8 mx-auto">
        <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <CheckoutStepper 
              steps={steps} 
              activeStep={currentStep}
            />
            
            <div className="p-6 mt-6 bg-white rounded-lg shadow">
              {currentStep === 0 && (
                <ShippingAddressForm 
                  initialValues={shippingInfo} 
                  onSubmit={handleShippingSubmit} 
                />
              )}
              
              {currentStep === 1 && (
                <PaymentForm 
                  initialValues={paymentInfo}
                  onSubmit={handlePaymentSubmit}
                  onBack={handlePrevStep}
                />
              )}
              
              {currentStep === 2 && (
                <CheckoutConfirmation 
                  bicycle={bicycle}
                  shippingInfo={shippingInfo}
                  paymentInfo={paymentInfo}
                  onBack={handlePrevStep}
                  onPlaceOrder={handlePlaceOrder}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>
          
          <div>
            <OrderSummary bicycle={bicycle} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
