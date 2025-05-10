import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SellBikeFormValues } from './types';

interface PricingLocationStepProps {
  form: UseFormReturn<SellBikeFormValues>;
}

const PricingLocationStep = ({ form }: PricingLocationStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Pricing & Location</h2>
        <p className="text-sm text-gray-500">
          Set your asking price and where the bike is located.
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Asking Price ($)</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <Input 
                  type="text" 
                  inputMode="numeric" 
                  pattern="[0-9]*"
                  className="pl-6" 
                  placeholder="1,200"
                  {...field}
                />
              </div>
            </FormControl>
            <FormDescription>
              Research similar bikes to set a competitive price
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input 
                placeholder="City, State" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Enter the city and state where the bike is located
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="contactMethod"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Preferred Contact Method</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="app" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    In-App Messaging
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="email" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Email
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="phone" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Phone Call
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="text" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Text Message
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PricingLocationStep;
