
import React from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';

interface Message {
  id: number;
  sender: string;
  message: string;
  timestamp: Date;
  isOffer?: boolean;
  offerAmount?: number;
  status?: string;
  accepted?: boolean;
}

interface MessageListProps {
  messages: Message[];
  sellerName: string;
}

const MessageList = ({ messages, sellerName }: MessageListProps) => {
  const { t } = useTranslation();
  
  if (messages.length === 0) {
    return (
      <Card className="text-center py-10 mb-6">
        <div className="pt-6">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{t('noMessages')}</h3>
          <p className="mt-2 text-sm text-gray-500">{t('startConversation')}</p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="flex flex-col space-y-4 mb-6">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[80%] rounded-lg p-4 ${
              msg.sender === 'buyer' 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none'
            }`}
          >
            {msg.isOffer && (
              <div className={`mb-1 ${
                msg.sender === 'buyer' ? 'text-white' : 'text-gray-600'
              }`}>
                <div className="font-semibold">
                  {t('offer')}: ${msg.offerAmount?.toLocaleString()}
                </div>
                {msg.status && (
                  <div className="text-sm">
                    {msg.status === 'sent' ? t('sent') : msg.status}
                  </div>
                )}
                {msg.accepted && (
                  <span className="ml-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                    {t('accepted')}
                  </span>
                )}
              </div>
            )}
            {!msg.isOffer && <p>{msg.message}</p>}
            <div className={`text-xs mt-2 ${
              msg.sender === 'buyer' ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {format(new Date(msg.timestamp), 'HH:mm')}
            </div>
          </div>
          {msg.sender === 'seller' && (
            <Avatar className="h-8 w-8 ml-2">
              <div className="bg-green-500 text-white h-full w-full flex items-center justify-center">
                {sellerName[0]}
              </div>
            </Avatar>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
