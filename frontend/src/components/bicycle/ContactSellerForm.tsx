
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const ContactSellerForm = () => {
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Message submitted:', message);
    // In a real app, this would send the message to the seller
    setMessage('');
    // Show success feedback
    toast({
      title: "訊息已送出",
      description: "您的訊息已成功發送給賣家！",
    });
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium">{t('contactSeller')}</h3>
      <form onSubmit={handleSubmitMessage} className="mt-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('askQuestion')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
          rows={4}
          required
        ></textarea>
        
        <Button type="submit" className="mt-4 bg-marketplace-blue hover:bg-blue-600">
          <MessageCircle className="mr-2 h-5 w-5" />
          {t('sendMessage')}
        </Button>
      </form>
    </div>
  );
};

export default ContactSellerForm;
