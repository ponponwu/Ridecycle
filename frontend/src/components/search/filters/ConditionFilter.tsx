
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ConditionFilterProps {
  selectedConditions: string[];
  toggleConditionFilter: (condition: string) => void;
}

const ConditionFilter: React.FC<ConditionFilterProps> = ({
  selectedConditions,
  toggleConditionFilter
}) => {
  const { t } = useTranslation();
  
  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-3">{t('condition')}</h3>
      <div className="space-y-2">
        {conditions.map((condition) => (
          <div key={condition} className="flex items-center">
            <input 
              type="checkbox" 
              id={condition.toLowerCase().replace(' ', '-')}
              checked={selectedConditions.includes(condition)}
              onChange={() => toggleConditionFilter(condition)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={condition.toLowerCase().replace(' ', '-')} className="ml-2 text-sm text-gray-700">
              {condition}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConditionFilter;
