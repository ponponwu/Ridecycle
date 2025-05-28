
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const BicycleDetailsLoading: React.FC = () => {
  return (
    <div className="flex justify-center py-8">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );
};

export default BicycleDetailsLoading;
