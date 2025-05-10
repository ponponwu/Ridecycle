
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

interface CheckoutConfirmationProps {
  bicycle: any;
  shippingInfo: any;
  paymentInfo: any;
  onBack: () => void;
  onPlaceOrder: () => void;
  isSubmitting: boolean;
}

const CheckoutConfirmation = ({
  bicycle,
  shippingInfo,
  paymentInfo,
  onBack,
  onPlaceOrder,
  isSubmitting
}: CheckoutConfirmationProps) => {
  // Format card number to only show last 4 digits
  const maskedCardNumber = paymentInfo.cardNumber 
    ? `•••• •••• •••• ${paymentInfo.cardNumber.slice(-4)}` 
    : '';
    
  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Order Confirmation</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-lg font-medium">Shipping Address</h3>
          <div className="p-4 border rounded-md bg-gray-50">
            <p className="font-medium">{shippingInfo.fullName}</p>
            <p>{shippingInfo.addressLine1}</p>
            {shippingInfo.addressLine2 && <p>{shippingInfo.addressLine2}</p>}
            <p>{`${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.postalCode}`}</p>
            <p>{shippingInfo.country}</p>
            <p className="mt-1">Phone: {shippingInfo.phoneNumber}</p>
          </div>
        </div>
        
        <div>
          <h3 className="mb-2 text-lg font-medium">Payment Method</h3>
          <div className="p-4 border rounded-md bg-gray-50">
            <p className="font-medium">{paymentInfo.cardName}</p>
            <p>Card Number: {maskedCardNumber}</p>
            <p>Expiry: {paymentInfo.expiryMonth}/{paymentInfo.expiryYear}</p>
          </div>
        </div>
        
        <div>
          <h3 className="mb-2 text-lg font-medium">Order Details</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Item</TableCell>
                <TableCell>{bicycle.title}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Price</TableCell>
                <TableCell>${bicycle.price.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Shipping</TableCell>
                <TableCell>$25.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Tax</TableCell>
                <TableCell>${(bicycle.price * 0.08).toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total</TableCell>
                <TableCell className="font-semibold">${(bicycle.price + 25 + bicycle.price * 0.08).toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <div className="flex justify-between mt-8">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button 
            onClick={onPlaceOrder} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutConfirmation;
