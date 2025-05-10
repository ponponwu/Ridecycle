import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { SellBikeFormValues } from './types';

interface ReviewStepProps {
  form: UseFormReturn<SellBikeFormValues>;
}

const ReviewStep = ({ form }: ReviewStepProps) => {
  const formValues = form.getValues();
  
  const contactMethods = {
    app: "In-App Messaging",
    email: "Email",
    phone: "Phone Call",
    text: "Text Message",
  };
  
  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Review Your Listing</h2>
        <p className="text-sm text-gray-500">
          Please review all the information before submitting your listing.
        </p>
      </div>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-md font-medium text-gray-900 mb-3">Bike Details</h3>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Title</h4>
                  <p className="text-sm">{formValues.title || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Brand</h4>
                  <p className="text-sm">{formValues.brand || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Model</h4>
                  <p className="text-sm">{formValues.model || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Year</h4>
                  <p className="text-sm">{formValues.year || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Type</h4>
                  <p className="text-sm">{formValues.bikeType || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Frame Size</h4>
                  <p className="text-sm">{formValues.frameSize || "Not provided"}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-500">Description</h4>
                <p className="text-sm whitespace-pre-wrap">{formValues.description || "Not provided"}</p>
              </div>
            </CardContent>
          </Card>
        </section>
        
        <section>
          <h3 className="text-md font-medium text-gray-900 mb-3">Photos & Condition</h3>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">Photos</h4>
                {formValues.photos && formValues.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Array.from(formValues.photos).map((file: any, index) => (
                      <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-50">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Bike photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-red-500">No photos uploaded</p>
                )}
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-500">Condition</h4>
                <p className="text-sm">{formValues.condition || "Not provided"}</p>
              </div>
            </CardContent>
          </Card>
        </section>
        
        <section>
          <h3 className="text-md font-medium text-gray-900 mb-3">Pricing & Location</h3>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Asking Price</h4>
                  <p className="text-sm font-medium text-green-600">${formValues.price || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Location</h4>
                  <p className="text-sm">{formValues.location || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500">Contact Method</h4>
                  <p className="text-sm">
                    {formValues.contactMethod ? 
                      contactMethods[formValues.contactMethod as keyof typeof contactMethods] : 
                      "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      
      <div className="rounded-lg bg-green-50 p-4 flex items-start space-x-3">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-green-800">Ready to list your bike</h3>
          <p className="text-sm text-green-700 mt-1">
            Click the "List Bike for Sale" button below to complete your listing. 
            Your bike will be visible to potential buyers immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
