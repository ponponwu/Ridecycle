
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Bike, Users, MessageCircle, Home, Settings, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminNavbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 z-10 hidden md:block">
      <div className="p-6">
        <div className="pb-4 mb-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{t('adminPanel')}</h2>
        </div>
        
        <nav className="space-y-2">
          <Link
            to="/admin"
            className={cn(
              "flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200",
              isActive('/admin') && "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
            )}
          >
            <Home className="h-5 w-5 mr-3" />
            {t('admin.adminDashboard')}
          </Link>
          
          <Link
            to="/admin/bicycles"
            className={cn(
              "flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200",
              isActive('/admin/bicycles') && "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
            )}
          >
            <Bike className="h-5 w-5 mr-3" />
            {t('admin.bicycleManagement')}
          </Link>
          
          <Link
            to="/admin/users"
            className={cn(
              "flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200",
              isActive('/admin/users') && "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
            )}
          >
            <Users className="h-5 w-5 mr-3" />
            {t('admin.userManagement')}
          </Link>
          
          <Link
            to="/admin/messages"
            className={cn(
              "flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200",
              isActive('/admin/messages') && "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
            )}
          >
            <MessageCircle className="h-5 w-5 mr-3" />
            {t('admin.allMessages')}
          </Link>
          
          <Link
            to="/admin/feedbacks"
            className={cn(
              "flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200",
              isActive('/admin/feedbacks') && "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
            )}
          >
            <HelpCircle className="h-5 w-5 mr-3" />
            意見反饋管理
          </Link>
          
          <Link
            to="/admin/settings"
            className={cn(
              "flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200",
              isActive('/admin/settings') && "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
            )}
          >
            <Settings className="h-5 w-5 mr-3" />
            {t('admin.systemSettings')}
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default AdminNavbar;
