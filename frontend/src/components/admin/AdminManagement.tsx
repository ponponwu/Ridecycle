
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Bike, MessageCircle, Users, Settings, AlertTriangle } from 'lucide-react';
import BicycleManagement from './BicycleManagement';
import MessageManagement from './MessageManagement';

const AdminManagement: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language === 'zh';
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isChinese ? '管理員控制台' : t('adminManagement')}</h1>
        <p className="text-gray-500">{isChinese ? '管理您的應用程式' : t('manageYourApplication')}</p>
      </div>
      
      <Tabs defaultValue="bicycles" className="space-y-6">
        <TabsList className="bg-background border mb-6">
          <TabsTrigger value="bicycles" className="data-[state=active]:bg-muted flex items-center gap-2">
            <Bike className="w-4 h-4" />
            <span>{isChinese ? '自行車管理' : t('bicycleManagement')}</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-muted flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span>{isChinese ? '消息管理' : t('messageManagement')}</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-muted flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{isChinese ? '用戶管理' : t('userManagement')}</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-muted flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{isChinese ? '舉報內容' : t('reportedContent')}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-muted flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>{isChinese ? '系統設置' : t('systemSettings')}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bicycles" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
          <BicycleManagement />
        </TabsContent>
        
        <TabsContent value="messages" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
          <MessageManagement />
        </TabsContent>
        
        <TabsContent value="users" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
          <Card className="p-6">
            <h2 className="text-xl font-medium mb-4">{isChinese ? '用戶管理' : t('userManagement')}</h2>
            <p className="text-gray-500">{isChinese ? '管理用戶帳戶和權限設置' : t('userManagementDescription')}</p>
            <div className="mt-4 text-center text-gray-500 py-8">
              {isChinese ? '即將上線' : t('comingSoon')}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
          <Card className="p-6">
            <h2 className="text-xl font-medium mb-4">{isChinese ? '舉報內容' : t('reportedContent')}</h2>
            <p className="text-gray-500">{isChinese ? '審核用戶舉報的內容' : t('reportedContentDescription')}</p>
            <div className="mt-4 text-center text-gray-500 py-8">
              {isChinese ? '即將上線' : t('comingSoon')}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="focus-visible:outline-none focus-visible:ring-0 mt-0">
          <Card className="p-6">
            <h2 className="text-xl font-medium mb-4">{isChinese ? '系統設置' : t('systemSettings')}</h2>
            <p className="text-gray-500">{isChinese ? '配置系統設置和偏好' : t('systemSettingsDescription')}</p>
            <div className="mt-4 text-center text-gray-500 py-8">
              {isChinese ? '即將上線' : t('comingSoon')}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminManagement;
