
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Bike, Users, MessageCircle, Home, Settings, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminNavbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 z-10 hidden md:block">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6">{t('adminPanel')}</h2>
        
        <nav className="space-y-1">
          <Link
            to="/admin"
            className={cn(
              "flex items-center px-4 py-3 text-gray-700 rounded-lg",
              isActive('/admin') && "bg-blue-50 text-blue-700"
            )}
          >
            <Home className="h-5 w-5 mr-3" />
            {t('adminDashboard')}
          </Link>
          
          <Link
            to="/admin/manage"
            className={cn(
              "flex items-center px-4 py-3 text-gray-700 rounded-lg",
              isActive('/admin/manage') && "bg-blue-50 text-blue-700"
            )}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            {t('adminManagement')}
          </Link>
          
          <Link
            to="/admin/bicycles"
            className={cn(
              "flex items-center px-4 py-3 text-gray-700 rounded-lg",
              isActive('/admin/bicycles') && "bg-blue-50 text-blue-700"
            )}
          >
            <Bike className="h-5 w-5 mr-3" />
            {t('bicycleManagement')}
          </Link>
          
          <Link
            to="/admin/users"
            className={cn(
              "flex items-center px-4 py-3 text-gray-700 rounded-lg",
              isActive('/admin/users') && "bg-blue-50 text-blue-700"
            )}
          >
            <Users className="h-5 w-5 mr-3" />
            {t('userManagement')}
          </Link>
          
          <Link
            to="/admin/messages"
            className={cn(
              "flex items-center px-4 py-3 text-gray-700 rounded-lg",
              isActive('/admin/messages') && "bg-blue-50 text-blue-700"
            )}
          >
            <MessageCircle className="h-5 w-5 mr-3" />
            {t('allMessages')}
          </Link>
          
          <Link
            to="/admin/settings"
            className={cn(
              "flex items-center px-4 py-3 text-gray-700 rounded-lg",
              isActive('/admin/settings') && "bg-blue-50 text-blue-700"
            )}
          >
            <Settings className="h-5 w-5 mr-3" />
            {t('systemSettings')}
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default AdminNavbar;
