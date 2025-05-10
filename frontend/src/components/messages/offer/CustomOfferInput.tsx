
import React from 'react';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface CustomOfferInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled?: boolean;
}

const CustomOfferInput = ({ value, onChange, placeholder, disabled = false }: CustomOfferInputProps) => {
  const { t } = useTranslation();
  
  return (
    <div className={`p-3 border rounded-lg ${disabled ? 'bg-gray-50' : ''}`}>
      <div className="text-gray-700">{t('individualOffer')}</div>
      <Input
        type="number"
        value={value}
        onChange={onChange}
        className="mt-1 border-0 p-0 focus:ring-0 text-lg font-semibold bg-transparent"
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};

export default CustomOfferInput;
