import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  Form
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { SellBikeFormValues } from './types';

// Generate years from 1980 to current year
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1979 }, (_, i) => (currentYear - i).toString());

// Bike types
const bikeTypes = [
  "Road Bike",
  "Mountain Bike",
  "Hybrid Bike",
  "City Bike",
  "Cruiser Bike",
  "Electric Bike",
  "Folding Bike",
  "Gravel Bike",
  "Fixed Gear / Single Speed",
  "BMX",
  "Kids Bike",
  "Other"
];

// Frame sizes
const frameSizes = [
  "XXS", "XS", "S", "M", "L", "XL", "XXL",
  "48cm", "50cm", "52cm", "54cm", "56cm", "58cm", "60cm", "62cm",
  "13\"", "15\"", "17\"", "19\"", "21\""
];

interface BasicDetailsStepProps {
  form: UseFormReturn<SellBikeFormValues>;
}

const BasicDetailsStep = ({ form }: BasicDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Bike Details</h2>
        <p className="text-sm text-gray-500">
          Provide the basic information about your bike.
        </p>
      </div>

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Listing Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g., 2021 Trek Domane SL5 - Excellent Condition" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Trek, Specialized, Giant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Domane SL5, Stumpjumper" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
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
          name="bikeType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bike Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bike type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bikeTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="frameSize"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Frame Size</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select frame size" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {frameSizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
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
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe your bike in detail. Include information about components, upgrades, maintenance history, and any issues." 
                className="min-h-32"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicDetailsStep;
