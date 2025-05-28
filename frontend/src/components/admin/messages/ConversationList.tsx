
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Message, formatDate, getConversationId } from '@/utils/messageUtils';

interface ConversationListProps {
  messages: Message[];
  loading: boolean;
  selectedChat: string | null;
  onSelectConversation: (bicycleId: string, senderId: string, receiverId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  messages, 
  loading, 
  selectedChat, 
  onSelectConversation 
}) => {
  const { t } = useTranslation();
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t('noMessagesFound')}</p>
      </div>
    );
  }
  
  // Create a map of unique conversations based on bicycle_id, sender_id, and receiver_id
  const uniqueConversations = [...new Map(messages.map(msg => 
    [getConversationId(msg.bicycle_id, msg.sender_id, msg.receiver_id), msg]
  )).values()];
  
  return (
    <div className="divide-y max-h-[600px] overflow-y-auto">
      {uniqueConversations.map((msg) => (
        <div 
          key={msg.id}
          onClick={() => onSelectConversation(msg.bicycle_id, msg.sender_id, msg.receiver_id)}
          className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedChat === getConversationId(msg.bicycle_id, msg.sender_id, msg.receiver_id) 
              ? 'bg-blue-50 border-l-4 border-blue-500' 
              : ''
          }`}
        >
          <div className="flex justify-between">
            <p className="font-medium truncate">
              {msg.sender?.full_name || t('unknownUser')} → {msg.receiver?.full_name || t('unknownUser')}
            </p>
            <span className="text-xs text-gray-500">{formatDate(msg.created_at).split(',')[0]}</span>
          </div>
          <p className="text-sm text-gray-600 truncate">{msg.message}</p>
          <p className="text-xs text-gray-400 truncate mt-1">
            {msg.bicycle?.title || t('deletedBicycle')}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
