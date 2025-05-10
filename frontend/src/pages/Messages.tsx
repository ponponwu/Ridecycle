import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from '@/hooks/use-toast';
import ChatHeader from '@/components/messages/ChatHeader';
import ConversationSidebar from '@/components/messages/ConversationSidebar';
import MessageList from '@/components/messages/MessageList';
import MessageInput from '@/components/messages/MessageInput';
import SafetyBanner from '@/components/messages/SafetyBanner';
import SellerInfo from '@/components/messages/SellerInfo';

// Sample bicycle data - In a real app, this would come from an API
const bicyclesData = {
  'bicycle-1': {
    id: '1',
    title: 'Specialized Stumpjumper Expert Carbon 29',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890',
    seller: {
      name: 'Michael Thompson',
      location: 'Seattle, WA',
      currency: 'USD',
    }
  },
  'bicycle-2': {
    id: '2',
    title: 'Émonda SL 5 Disc 2022',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91',
    seller: {
      name: 'Mauricio',
      location: 'Miami, United States',
      currency: 'USD',
    }
  },
};

// Sample conversation data - In a real app, this would come from an API
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

// Sample message data - In a real app, this would come from an API
const sampleMessages = {
  'bicycle-1': [
    {
      id: 1,
      sender: 'buyer',
      message: '我對您的腳踏車感興趣，我願意出價$2500。',
      timestamp: new Date(2025, 4, 5, 14, 30),
      isOffer: true,
      offerAmount: 2500,
    },
    {
      id: 2,
      sender: 'seller',
      message: '謝謝您的興趣！不過我希望至少能賣$2700。',
      timestamp: new Date(2025, 4, 5, 15, 45),
      isOffer: false,
    },
    {
      id: 3,
      sender: 'buyer',
      message: '我可以提高到$2600，這是我能提供的最高價格。',
      timestamp: new Date(2025, 4, 6, 9, 20),
      isOffer: true,
      offerAmount: 2600,
    },
    {
      id: 4,
      sender: 'seller',
      message: '好的，我接受您的出價。請問您方便何時來取車？',
      timestamp: new Date(2025, 4, 6, 10, 5),
      isOffer: false,
      accepted: true,
    },
  ],
  'bicycle-2': [
    {
      id: 1,
      sender: 'buyer',
      message: '您好，這台腳踏車還在銷售嗎？',
      timestamp: new Date(2025, 4, 7, 11, 15),
      isOffer: false,
    },
    {
      id: 2,
      sender: 'buyer',
      message: 'Offer: $1,870',
      timestamp: new Date(2025, 4, 7, 20, 34),
      isOffer: true,
      offerAmount: 1870,
      status: 'sent'
    },
  ],
};

const Messages = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const bicycleId = searchParams.get('bicycleId') || 'bicycle-2';
  const navigate = useNavigate();
  const [showOfferPopover, setShowOfferPopover] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Add local state to store messages so we can update them dynamically
  const [localMessages, setLocalMessages] = useState<Record<string, any[]>>(sampleMessages);
  
  const messages = localMessages[bicycleId as keyof typeof localMessages] || [];
  const bicycle = bicyclesData[bicycleId as keyof typeof bicyclesData] || {
    title: 'Bicycle',
    price: 0,
    image: '',
    seller: { name: 'Seller', location: 'Unknown', currency: 'USD' }
  };
  
  const handleSendMessage = (message: string) => {
    // Create a new message
    const newMsg = {
      id: messages.length + 1,
      sender: 'buyer',
      message: message,
      timestamp: new Date(),
      isOffer: false
    };
    
    // Update the messages for this conversation
    setLocalMessages(prev => ({
      ...prev,
      [bicycleId]: [...(prev[bicycleId as keyof typeof prev] || []), newMsg]
    }));
    
    // Show toast notification
    toast({
      title: t('messageSent'),
      description: t('yourMessageHasBeenSent'),
    });
  };

  const toggleOfferPopover = () => {
    setShowOfferPopover(!showOfferPopover);
  };
  
  const handleMakeOffer = (amount: number) => {
    // Create a new message for the offer
    const newOfferMsg = {
      id: messages.length + 1,
      sender: 'buyer',
      message: `${t('offer')}: $${amount.toLocaleString()}`,
      timestamp: new Date(),
      isOffer: true,
      offerAmount: amount,
      status: 'sent'
    };
    
    // Update the messages for this conversation
    setLocalMessages(prev => ({
      ...prev,
      [bicycleId]: [...(prev[bicycleId as keyof typeof prev] || []), newOfferMsg]
    }));
    
    // Close the offer popover
    setShowOfferPopover(false);
  };
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  const handleSelectConversation = (id: string) => {
    navigate(`/messages?bicycleId=${id}`);
  };

  return (
    <MainLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Conversations Sidebar */}
        <ConversationSidebar 
          conversations={sampleConversations}
          currentBicycleId={bicycleId}
          onSelectConversation={handleSelectConversation}
        />
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Mobile Sidebar Toggle */}
          <button
            className="md:hidden absolute top-4 left-4 z-20"
            onClick={toggleSidebar}
          >
            <ArrowLeft className={`h-5 w-5 transition-transform ${showSidebar ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Bicycle Info Header */}
          <ChatHeader 
            bicycle={bicycle}
            onBack={() => navigate(-1)}
          />
          
          {/* Safe Trading Banner */}
          <SafetyBanner />

          {/* Seller Info Card */}
          <SellerInfo 
            name={bicycle.seller.name}
            location={bicycle.seller.location}
            currency={bicycle.seller.currency}
          />
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
            <MessageList 
              messages={messages}
              sellerName={bicycle.seller.name}
            />
          </div>
          
          {/* Message Input Area */}
          <MessageInput 
            onSendMessage={handleSendMessage}
            onMakeOffer={handleMakeOffer}
            showOfferPopover={showOfferPopover}
            toggleOfferPopover={toggleOfferPopover}
            originalPrice={bicycle.price}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
