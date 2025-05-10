import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Upload, X } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { SellBikeFormValues } from './types';

interface PhotosStepProps {
  form: UseFormReturn<SellBikeFormValues>;
}

const conditions = [
  "New - Never Used",
  "Like New - Used only a few times",
  "Excellent - Minimal wear",
  "Good - Normal wear for age",
  "Fair - Works well but shows wear",
  "Poor - Needs work"
];

const PhotosStep = ({ form }: PhotosStepProps) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const newPhotos = [...form.getValues('photos')];
    const newUrls = [...previewUrls];
    
    Array.from(files).forEach(file => {
      newPhotos.push(file);
      newUrls.push(URL.createObjectURL(file));
    });
    
    form.setValue('photos', newPhotos, { shouldValidate: true });
    setPreviewUrls(newUrls);
  };
  
  const removePhoto = (index: number) => {
    const newPhotos = [...form.getValues('photos')];
    const newUrls = [...previewUrls];
    
    newPhotos.splice(index, 1);
    newUrls.splice(index, 1);
    
    form.setValue('photos', newPhotos, { shouldValidate: true });
    setPreviewUrls(newUrls);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Photos & Condition</h2>
        <p className="text-sm text-gray-500">
          Upload photos of your bike and describe its condition.
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="photos"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Photos (up to 10)</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <Card className="border-dashed">
                  <CardContent className="p-6">
                    <label className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm font-medium">
                        Drop files here or click to upload
                      </span>
                      <span className="text-xs text-gray-500">
                        Include multiple angles of your bike. First photo will be the main image.
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={previewUrls.length >= 10}
                      />
                      <Button 
                        variant="outline" 
                        type="button"
                        disabled={previewUrls.length >= 10}
                      >
                        Browse Files
                      </Button>
                    </label>
                  </CardContent>
                </Card>
                
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-md overflow-hidden border bg-gray-50">
                          <img
                            src={url}
                            alt={`Bike photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md">
                            Main photo
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="condition"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Condition</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {conditions.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PhotosStep;
