
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard } from 'lucide-react';

const paymentSchema = z.object({
  cardName: z.string().min(2, { message: "Cardholder name is required" }),
  cardNumber: z.string()
    .min(13, { message: "Card number must have at least 13 digits" })
    .max(19, { message: "Card number cannot exceed 19 digits" })
    .refine(val => /^\d+$/.test(val), { message: "Card number must contain only digits" }),
  expiryMonth: z.string().min(1, { message: "Month is required" }),
  expiryYear: z.string().min(1, { message: "Year is required" }),
  cvv: z.string()
    .min(3, { message: "CVV must be 3-4 digits" })
    .max(4, { message: "CVV must be 3-4 digits" })
    .refine(val => /^\d+$/.test(val), { message: "CVV must contain only digits" }),
  saveCard: z.boolean().optional(),
});

const months = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  return { value: month.toString().padStart(2, '0'), label: month.toString().padStart(2, '0') };
});

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => {
  const year = currentYear + i;
  return { value: year.toString(), label: year.toString() };
});

interface PaymentFormProps {
  initialValues?: any;
  onSubmit: (data: any) => void;
  onBack: () => void;
}

const PaymentForm = ({ initialValues = {}, onSubmit, onBack }: PaymentFormProps) => {
  const form = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: initialValues.cardName || "",
      cardNumber: initialValues.cardNumber || "",
      expiryMonth: initialValues.expiryMonth || "",
      expiryYear: initialValues.expiryYear || "",
      cvv: initialValues.cvv || "",
      saveCard: initialValues.saveCard || false,
    }
  });

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .trim();
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Payment Information</h2>
      
      <div className="flex items-center gap-2 p-3 mb-6 text-sm bg-blue-50 rounded-md">
        <CreditCard className="w-5 h-5 text-blue-500" />
        <span>All payment information is encrypted and secure</span>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="cardName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name on Card</FormLabel>
                <FormControl>
                  <Input placeholder="Enter cardholder name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="1234 5678 9012 3456" 
                    {...field} 
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      e.target.value = formatted;
                      field.onChange(formatted.replace(/\s/g, ''));
                    }}
                    maxLength={19}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="expiryMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expiryYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cvv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CVV</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123" 
                      maxLength={4} 
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        e.target.value = value;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="saveCard"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-1">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Save card for future purchases</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-between mt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit">
              Review Order
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PaymentForm;
