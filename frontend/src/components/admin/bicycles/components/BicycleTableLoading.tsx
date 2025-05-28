
import React from 'react';
import { useTranslation } from 'react-i18next';

interface BicycleTableLoadingProps {
  loading: boolean;
}

const BicycleTableLoading: React.FC<BicycleTableLoadingProps> = ({ loading }) => {
  if (!loading) return null;
  
  return (
    <div className="flex justify-center py-8">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );
};

export default BicycleTableLoading;
