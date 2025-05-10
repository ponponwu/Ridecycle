
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface MakeOfferDialogProps {
  bicycleTitle: string;
  bicycleId?: string;
}

const MakeOfferDialog = ({ bicycleTitle, bicycleId = '1' }: MakeOfferDialogProps) => {
  const [offer, setOffer] = useState('');
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmitOffer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Offer submitted:', offer);
    
    // In a real app, this would send the offer to the server
    
    // Show success feedback
    toast({
      title: "出價已送出",
      description: `您已成功出價 $${offer}！`,
    });
    
    // Close dialog
    setOpen(false);
    
    // Navigate to messages page with the bicycle ID
    navigate(`/messages?bicycleId=bicycle-${bicycleId}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-marketplace-orange hover:bg-orange-600">
          <DollarSign className="mr-2 h-5 w-5" />
          {t('makeOffer')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('makeOffer')}</DialogTitle>
          <DialogDescription>
            {t('yourOffer')} ({bicycleTitle})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmitOffer}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <Input 
                type="number" 
                min="1"
                value={offer} 
                onChange={(e) => setOffer(e.target.value)}
                placeholder="Enter your offer amount" 
                className="col-span-3" 
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{t('submit')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MakeOfferDialog;
