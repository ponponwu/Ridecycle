
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bike } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MyBicycles = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t('myBicycles')}</h3>
        <Button onClick={() => navigate('/upload')} variant="outline">{t('publishNewBike')}</Button>
      </div>
      <div className="text-center py-12 border rounded-lg bg-gray-50">
        <Bike className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">{t('youHaveNotPublishedAnyBikes')}</h3>
        <p className="mt-2 text-sm text-gray-500">{t('startPublishingYourFirstBike')}</p>
        <Button className="mt-4 bg-marketplace-blue hover:bg-blue-600" onClick={() => navigate('/upload')}>
          {t('publishNow')}
        </Button>
      </div>
    </div>
  );
};

export default MyBicycles;
