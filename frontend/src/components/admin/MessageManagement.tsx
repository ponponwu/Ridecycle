
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Message, RawMessage, 
  transformMessageData, getConversationId 
} from '@/utils/messageUtils';
import ConversationList from './messages/ConversationList';
import ConversationDetail from './messages/ConversationDetail';

const MessageManagement: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    fetchMessages();
  }, []);
  
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(full_name),
          receiver:profiles!receiver_id(full_name),
          bicycle:bicycles(title)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      
      // Transform the raw data to ensure proper typing
      const transformedData: Message[] = (data || []).map(msg => {
        const transformedMsg = transformMessageData(msg as RawMessage);
        return {
          ...transformedMsg,
          sender: transformedMsg.sender || { full_name: t('unknownUser') },
          receiver: transformedMsg.receiver || { full_name: t('unknownUser') },
          bicycle: transformedMsg.bicycle || { title: t('unknownBicycle') }
        };
      });
      
      setMessages(transformedData);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('failedToFetchMessages'),
      });
    } finally {
      setLoading(false);
    }
  };
  
  const viewConversation = async (bicycleId: string, senderId: string, receiverId: string) => {
    try {
      // Fetch all messages between these users for this bicycle
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(full_name),
          receiver:profiles!receiver_id(full_name),
          bicycle:bicycles(title)
        `)
        .eq('bicycle_id', bicycleId)
        .or(`sender_id.eq.${senderId},sender_id.eq.${receiverId}`)
        .or(`receiver_id.eq.${senderId},receiver_id.eq.${receiverId}`)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Transform the raw data to ensure proper typing
      const transformedData: Message[] = (data || []).map(msg => {
        const transformedMsg = transformMessageData(msg as RawMessage);
        return {
          ...transformedMsg,
          sender: transformedMsg.sender || { full_name: t('unknownUser') },
          receiver: transformedMsg.receiver || { full_name: t('unknownUser') },
          bicycle: transformedMsg.bicycle || { title: t('unknownBicycle') }
        };
      });
      
      setChatMessages(transformedData);
      setSelectedChat(getConversationId(bicycleId, senderId, receiverId));
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('failedToFetchConversation'),
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('allMessages')}</h1>
        <p className="text-gray-500">{t('viewAndManageUserMessages')}</p>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">{t('allMessages')}</TabsTrigger>
          <TabsTrigger value="unread">{t('unreadMessages')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Message List */}
              <div className="lg:col-span-1 border rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-3 border-b">
                  <h3 className="font-medium">{t('conversations')}</h3>
                </div>
                
                <ConversationList 
                  messages={messages}
                  loading={loading}
                  selectedChat={selectedChat}
                  onSelectConversation={viewConversation}
                />
              </div>
              
              {/* Message Detail */}
              <div className="lg:col-span-2 border rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-3 border-b">
                  <h3 className="font-medium">{t('conversation')}</h3>
                </div>
                
                <div className="p-4 max-h-[600px] overflow-y-auto">
                  <ConversationDetail 
                    chatMessages={chatMessages}
                    selectedChat={selectedChat}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="unread">
          <Card className="p-4">
            <div className="text-center py-8">
              <p className="text-gray-500">{t('unreadMessagesFeatureComingSoon')}</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessageManagement;
