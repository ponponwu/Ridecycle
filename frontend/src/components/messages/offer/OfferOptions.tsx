
import React from 'react';
import OfferTile from './OfferTile';

interface OfferOptionsProps {
  options: {
    amount: number;
    percentageOff: number;
    isRecommended?: boolean;
  }[];
  onSelectAmount: (amount: number) => void;
  isLoading?: boolean;
}

const OfferOptions = ({ options, onSelectAmount, isLoading = false }: OfferOptionsProps) => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {options.map((option, index) => (
        <OfferTile
          key={index}
          amount={option.amount}
          percentageOff={option.percentageOff}
          isRecommended={option.isRecommended}
          onClick={onSelectAmount}
          disabled={isLoading}
        />
      ))}
    </div>
  );
};

export default OfferOptions;
