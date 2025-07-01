
import React from 'react';
import { useTranslation } from 'react-i18next';

interface OfferTileProps {
  amount: number;
  percentageOff: number;
  isRecommended?: boolean;
  onClick: (amount: number) => void;
  disabled?: boolean;
}

const OfferTile = ({ amount, percentageOff, isRecommended = false, onClick, disabled = false }: OfferTileProps) => {
  const { t } = useTranslation();
  return (
    <div 
      className={`border rounded-lg p-3 text-center relative ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
      onClick={() => !disabled && onClick(amount)}
    >
      {isRecommended && (
        <div className="absolute top-0 left-0 w-full text-xs text-blue-600 bg-blue-50 rounded-t-lg">
          {isRecommended ? t('messagesPage.recommended') : ''}
        </div>
      )}
      <div className={`font-bold text-lg ${isRecommended ? 'mt-2' : ''}`}>
        ${amount.toLocaleString()}
      </div>
      <div className="text-sm text-gray-500">- {percentageOff}%</div>
    </div>
  );
};

export default OfferTile;
