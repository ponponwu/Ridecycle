
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

const SafetyBanner = () => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white px-4 py-3 border-b flex items-center">
      <ShieldCheck className="h-6 w-6 text-gray-500 mr-2" />
      <div>
        <p className="text-sm text-gray-700">
          {t('staySafe')}: {t('neverSharePersonalDetails')}
        </p>
        <a href="#" className="text-sm text-blue-600">{t('learnMore')}</a>
      </div>
    </div>
  );
};

export default SafetyBanner;
