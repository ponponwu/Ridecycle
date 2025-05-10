
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui/slider';

interface PriceRangeFilterProps {
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({ 
  priceRange,
  setPriceRange
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-3">{t('priceRange')}</h3>
      <div className="px-2">
        <Slider 
          value={priceRange} 
          max={5000} 
          step={100}
          onValueChange={setPriceRange}
        />
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
