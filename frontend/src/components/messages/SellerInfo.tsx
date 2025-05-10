
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, DollarSign } from 'lucide-react';

interface SellerInfoProps {
  name: string;
  location: string;
  currency: string;
}

const SellerInfo = ({ name, location, currency }: SellerInfoProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white px-4 py-3 border-b">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium">{t('hi')}, {t('imThe')} {name}</h3>
        <div className="flex items-center text-gray-700 mt-1">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{location}</span>
        </div>
        <div className="flex items-center text-gray-700 mt-1">
          <DollarSign className="h-4 w-4 mr-1" />
          <span className="text-sm">{currency} $</span>
        </div>
      </div>
    </div>
  );
};

export default SellerInfo;
