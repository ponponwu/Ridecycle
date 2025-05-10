
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@supabase/supabase-js';

interface PersonalInfoProps {
  user: User;
}

const PersonalInfo = ({ user }: PersonalInfoProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.user_metadata?.full_name || "用戶頭像"} />
          <AvatarFallback className="text-xl">{(user.user_metadata?.full_name || user.email || "U")[0]}</AvatarFallback>
        </Avatar>
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-2xl font-bold">{user.user_metadata?.full_name || "用戶"}</h2>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-500">加入時間：{new Date(user.created_at).toLocaleDateString('zh-TW')}</p>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">個人資料</h3>
            <dl className="grid gap-2 text-sm">
              <div className="grid grid-cols-3 gap-1 py-2 border-b last:border-0">
                <dt className="font-medium text-gray-500">全名</dt>
                <dd className="col-span-2">{user.user_metadata?.full_name || "未設置"}</dd>
              </div>
              <div className="grid grid-cols-3 gap-1 py-2 border-b last:border-0">
                <dt className="font-medium text-gray-500">電子郵箱</dt>
                <dd className="col-span-2">{user.email}</dd>
              </div>
              <div className="grid grid-cols-3 gap-1 py-2 border-b last:border-0">
                <dt className="font-medium text-gray-500">手機號碼</dt>
                <dd className="col-span-2">{user.phone || "未設置"}</dd>
              </div>
              <div className="grid grid-cols-3 gap-1 py-2 last:border-0">
                <dt className="font-medium text-gray-500">地址</dt>
                <dd className="col-span-2">{"未設置"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalInfo;
