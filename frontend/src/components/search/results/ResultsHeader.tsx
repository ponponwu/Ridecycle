
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface ResultsHeaderProps {
  resultsCount: number;
  loading: boolean;
  onToggleFilters: () => void;
  filterVisible: boolean;
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({ 
  resultsCount, 
  loading, 
  onToggleFilters,
  filterVisible
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{t('searchResults')}</h1>
      <Button 
        variant="outline" 
        onClick={onToggleFilters}
        className="lg:hidden"
      >
        {filterVisible ? t('hideFilters') : t('showFilters')}
      </Button>
    </div>
  );
};

export default ResultsHeader;
