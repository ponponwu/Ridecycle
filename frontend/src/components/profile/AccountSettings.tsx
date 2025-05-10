
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AccountSettingsProps {
  onSignOut: () => Promise<void>;
}

const AccountSettings = ({ onSignOut }: AccountSettingsProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">帳號設置</h3>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="password">
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              <span>更改密碼</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-1">
            <div className="space-y-4 p-2">
              <p className="text-sm text-gray-500">您可以在Supabase管理面板中更改密碼。</p>
              <Button variant="outline" size="sm">
                更改密碼
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notifications">
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              <span>通知設置</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-1">
            <div className="space-y-2 p-2">
              <p className="text-sm text-gray-500">設置您想接收的通知類型。</p>
              {/* 這裡可以添加通知設置項 */}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="account">
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              <span>帳號管理</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-1">
            <div className="space-y-4 p-2">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">需要更改您的帳號設置？</p>
                <Button variant="outline" size="sm">
                  編輯個人資料
                </Button>
              </div>
              
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-medium text-red-600">危險操作區域</p>
                <p className="text-sm text-gray-500">刪除您的帳號將永久移除所有數據。</p>
                <Button variant="destructive" size="sm">
                  刪除帳號
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-4 mt-6 border-t">
        <Button 
          variant="outline" 
          className="w-full sm:w-auto flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          登出帳號
        </Button>
      </div>
    </div>
  );
};

export default AccountSettings;
