
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BicycleGrid from '@/components/bicycles/BicycleGrid';
import BicycleListView from './BicycleListView';
import { Bicycle } from '../types';

interface ResultsTabsProps {
  bicycles: Bicycle[];
  loading: boolean;
  resetFilters: () => void;
}

const ResultsTabs: React.FC<ResultsTabsProps> = ({ bicycles, loading, resetFilters }) => {
  const { t } = useTranslation();

  const renderContent = (viewType: 'grid' | 'list') => {
    if (loading) {
      return (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-marketplace-blue"></div>
        </div>
      );
    } 
    
    if (bicycles.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">{t('noBicyclesFound')}</p>
          <Button className="mt-4" onClick={resetFilters}>
            {t('resetFilters')}
          </Button>
        </div>
      );
    }
    
    return viewType === 'grid' ? (
      <BicycleGrid bicycles={bicycles} />
    ) : (
      <BicycleListView bicycles={bicycles} />
    );
  };

  return (
    <Tabs defaultValue="grid">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-gray-500">{bicycles.length} {t('resultsFound')}</span>
          {loading && <span className="ml-2 text-sm text-blue-500">{t('loading')}...</span>}
        </div>
        <TabsList>
          <TabsTrigger value="grid">{t('grid')}</TabsTrigger>
          <TabsTrigger value="list">{t('list')}</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="grid" className="mt-0">
        {renderContent('grid')}
      </TabsContent>
      
      <TabsContent value="list" className="mt-0">
        {renderContent('list')}
      </TabsContent>
    </Tabs>
  );
};

export default ResultsTabs;
