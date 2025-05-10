
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';

interface BicycleDetailsHeaderProps {
  title: string;
  condition: string;
  brand: string;
  category: string;
  price: number;
  location: string;
}

const BicycleDetailsHeader = ({
  title,
  condition,
  brand,
  category,
  price,
  location
}: BicycleDetailsHeaderProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <Button
          variant="outline"
          size="icon"
          className={`rounded-full ${isFavorite ? 'text-marketplace-orange' : ''}`}
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Bookmark className={isFavorite ? "h-5 w-5 fill-marketplace-orange" : "h-5 w-5"} />
        </Button>
      </div>
      
      <div className="mt-2 flex items-center gap-2">
        <Badge variant="success">{condition}</Badge>
        <Badge>{brand}</Badge>
        <Badge>{category}</Badge>
      </div>
      
      <div className="mt-6">
        <div className="text-3xl font-bold text-marketplace-green">${price}</div>
        <p className="text-gray-500 mt-1">{t('location')}: {location}</p>
      </div>
    </div>
  );
};

export default BicycleDetailsHeader;
