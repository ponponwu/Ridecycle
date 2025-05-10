
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';

interface BicycleDetailsHeaderProps {
  title: string;
  condition: string;
  brand: string;
  category: string;
  price: number;
  location: string;
  bicycle?: any;
}

const BicycleDetailsHeader = ({
  title,
  condition,
  brand,
  category,
  price,
  location,
  bicycle
}: BicycleDetailsHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleBuyNow = () => {
    navigate('/checkout', { state: { bicycle } });
  };
  
  return (
    <div className="mb-6">
      <h1 className="mb-2 text-2xl font-bold lg:text-3xl">{title}</h1>
      
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant="outline" className="font-medium text-gray-700 bg-gray-100">
          {condition}
        </Badge>
        <Badge variant="outline" className="font-medium text-blue-700 bg-blue-50">
          {brand}
        </Badge>
        <Badge variant="outline" className="font-medium text-green-700 bg-green-50">
          {category}
        </Badge>
      </div>
      
      <div className="flex flex-col mb-4 space-y-2 sm:items-center sm:flex-row sm:justify-between sm:space-y-0">
        <div className="text-3xl font-bold text-marketplace-blue">
          ${price}
        </div>
        <div className="text-gray-600">
          {t('location')}: {location}
        </div>
      </div>
      
      {bicycle && (
        <Button className="mt-4 w-full sm:w-auto" onClick={handleBuyNow}>
          <ShoppingCart className="w-4 h-4 mr-2" />
          {t('buyNow')}
        </Button>
      )}
    </div>
  );
};

export default BicycleDetailsHeader;
