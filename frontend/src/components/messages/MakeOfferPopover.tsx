
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import OfferOptions from './offer/OfferOptions';
import CustomOfferInput from './offer/CustomOfferInput';

interface MakeOfferPopoverProps {
  originalPrice: number;
  onCancel: () => void;
  onSubmit: (amount: number) => void;
}

const MakeOfferPopover = ({ originalPrice, onCancel, onSubmit }: MakeOfferPopoverProps) => {
  const { t } = useTranslation();
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate recommended offers
  const fifteenPercent = Math.floor(originalPrice * 0.85);
  const tenPercent = Math.floor(originalPrice * 0.9);
  const fivePercent = Math.floor(originalPrice * 0.95);
  
  const offerOptions = [
    { amount: fivePercent, percentageOff: 5, isRecommended: false },
    { amount: tenPercent, percentageOff: 10, isRecommended: true },
    { amount: fifteenPercent, percentageOff: 15, isRecommended: false },
  ];
  
  const handleSelectAmount = async (amount: number) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: t('offerSent'),
        description: `$${amount.toLocaleString()} ${t('offerHasBeenSent')}`,
      });
      
      onSubmit(amount);
    } catch (error) {
      toast({
        title: t('errorSendingOffer'),
        description: t('pleaseTryAgain'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmitCustom = async () => {
    const amount = parseFloat(customAmount);
    
    if (!isNaN(amount) && amount > 0) {
      setIsSubmitting(true);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        toast({
          title: t('offerSent'),
          description: `$${amount.toLocaleString()} ${t('offerHasBeenSent')}`,
        });
        
        onSubmit(amount);
      } catch (error) {
        toast({
          title: t('errorSendingOffer'),
          description: t('pleaseTryAgain'),
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    } else {
      toast({
        title: t('invalidAmount'),
        description: t('pleaseEnterValidAmount'),
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">{t('makeAnOffer')}</h3>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <OfferOptions 
        options={offerOptions}
        onSelectAmount={handleSelectAmount}
        isLoading={isSubmitting}
      />
      
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <CustomOfferInput
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder={originalPrice.toString()}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="col-span-1">
          <Button 
            className="w-full h-full"
            onClick={handleSubmitCustom}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                {t('sending')}
              </>
            ) : (
              t('offer')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MakeOfferPopover;
