
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BicycleData {
  title: string;
  price: number;
  image: string;
  seller: {
    name: string;
    location: string;
    currency: string;
  };
}

interface ChatHeaderProps {
  bicycle: BicycleData;
  onBack: () => void;
}

const ChatHeader = ({ bicycle, onBack }: ChatHeaderProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white p-4 border-b flex items-center">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center flex-1 ml-2">
        <div className="h-12 w-12 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
          {bicycle.image && (
            <img 
              src={bicycle.image} 
              alt={bicycle.title} 
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="ml-3 overflow-hidden">
          <h2 className="text-base font-medium truncate">{bicycle.title}</h2>
          <p className="text-sm font-semibold">${bicycle.price.toLocaleString()}</p>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            {t('report')}
          </DropdownMenuItem>
          <DropdownMenuItem>
            {t('block')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatHeader;
