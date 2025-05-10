
import React from 'react';
import { useTranslation } from 'react-i18next';

interface BicycleDescriptionProps {
  description: string;
}

const BicycleDescription = ({ description }: BicycleDescriptionProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">{t('description')}</h2>
      <div className="prose max-w-none">
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
};

export default BicycleDescription;
