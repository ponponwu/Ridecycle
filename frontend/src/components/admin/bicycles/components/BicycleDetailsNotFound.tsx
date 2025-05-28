
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BicycleDetailsNotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-8">
      <p className="text-red-500">Bicycle not found</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={() => navigate('/admin/bicycles')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('back')}
      </Button>
    </div>
  );
};

export default BicycleDetailsNotFound;
