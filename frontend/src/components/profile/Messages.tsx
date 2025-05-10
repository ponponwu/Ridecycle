
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, User, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/ui/avatar';

// Sample messages data for demonstration
// In a real app, this would come from an API
const sampleConversations = [
  {
    id: 'bicycle-1',
    otherUser: 'Michael Thompson',
    lastMessage: '我可以提高到$2600，這是我能提供的最高價格。',
    timestamp: new Date(2025, 4, 6, 9, 20),
    unread: true,
    bicycleTitle: 'Specialized Stumpjumper Expert Carbon 29',
    bicycleImage: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890',
  },
  {
    id: 'bicycle-2',
    otherUser: 'Mauricio',
    lastMessage: '您好，這台腳踏車還在銷售嗎？',
    timestamp: new Date(2025, 4, 7, 11, 15),
    unread: false,
    bicycleTitle: 'Émonda SL 5 Disc 2022',
    bicycleImage: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91',
  },
];

const Messages = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleViewConversation = (id: string) => {
    navigate(`/messages?bicycleId=${id}`);
  };
  
  const handleViewAllMessages = () => {
    navigate('/messages');
  };
  
  const formatMessageDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('yesterday');
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t('messages')}</h3>
        <Button variant="ghost" size="sm" onClick={handleViewAllMessages}>
          {t('viewAll')}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      {/* Always show conversations if there are any */}
      {sampleConversations.length > 0 ? (
        <div className="space-y-2">
          {/* Show up to 3 conversations */}
          {sampleConversations.slice(0, 3).map((conversation) => (
            <div 
              key={conversation.id}
              onClick={() => handleViewConversation(conversation.id)}
              className="p-3 border rounded-lg flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
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
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{t('youHaveNoMessages')}</h3>
          <p className="mt-2 text-sm text-gray-500">{t('messagesWillAppearHere')}</p>
          <div className="flex justify-center gap-4 mt-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              {t('browseBicycles')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
