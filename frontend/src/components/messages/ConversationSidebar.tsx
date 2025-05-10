
import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { formatMessageDate } from '@/utils/dateUtils';

interface Conversation {
  id: string;
  otherUser: string;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
  bicycleTitle: string;
  bicycleImage: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentBicycleId: string;
  onSelectConversation: (id: string) => void;
}

const ConversationSidebar = ({ 
  conversations, 
  currentBicycleId, 
  onSelectConversation 
}: ConversationSidebarProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white border-r w-80 flex-shrink-0 transition-all duration-300 md:translate-x-0 fixed md:relative z-10 h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">{t('messages')}</h2>
      </div>
      
      <div className="overflow-y-auto h-[calc(100%-60px)]">
        {conversations.map((conversation) => (
          <div 
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`p-4 border-b flex cursor-pointer hover:bg-gray-50 transition-colors ${
              currentBicycleId === conversation.id ? 'bg-gray-100' : ''
            }`}
          >
            <div className="relative mr-3">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                {conversation.bicycleImage ? (
                  <img 
                    src={conversation.bicycleImage} 
                    alt={conversation.bicycleTitle}
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <Avatar>
                    <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white">
                      <User className="h-6 w-6" />
                    </div>
                  </Avatar>
                )}
              </div>
              {conversation.unread && (
                <div className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium text-sm truncate">{conversation.otherUser}</p>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatMessageDate(conversation.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
              <p className="text-xs text-gray-400 truncate">{conversation.bicycleTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationSidebar;
