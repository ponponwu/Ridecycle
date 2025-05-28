
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Message, formatDate } from '@/utils/messageUtils';

interface ConversationDetailProps {
  chatMessages: Message[];
  selectedChat: string | null;
}

const ConversationDetail: React.FC<ConversationDetailProps> = ({ 
  chatMessages,
  selectedChat
}) => {
  const { t } = useTranslation();
  
  if (!selectedChat) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t('selectConversationToView')}</p>
      </div>
    );
  }
  
  if (chatMessages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t('noMessagesInConversation')}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {chatMessages.map((msg) => (
        <div key={msg.id} className="flex flex-col">
          <div className="flex items-center mb-1">
            <span className="font-medium">{msg.sender?.full_name || t('unknownUser')}</span>
            <span className="text-xs text-gray-500 ml-2">
              {formatDate(msg.created_at)}
            </span>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg self-start max-w-[80%]">
            {msg.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationDetail;
