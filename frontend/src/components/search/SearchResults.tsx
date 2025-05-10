
import React from 'react';
import BicycleGrid from '@/components/bicycles/BicycleGrid';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';

// Mock data
const bicycles = [
  {
    id: '1',
    title: 'Specialized Stumpjumper Expert Carbon',
    price: 2800,
    location: 'Seattle, WA',
    condition: 'Like New',
    brand: 'Specialized',
    imageUrl: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'Trek Fuel EX 8 29',
    price: 1900,
    location: 'Portland, OR',
    condition: 'Good',
    brand: 'Trek',
    imageUrl: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'Canyon Neuron CF SL 8',
    price: 3200,
    location: 'Denver, CO',
    condition: 'Excellent',
    brand: 'Canyon',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    title: 'Santa Cruz Hightower LT Carbon',
    price: 4500,
    location: 'Boulder, CO',
    condition: 'Like New',
    brand: 'Santa Cruz',
    imageUrl: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    title: 'YT Jeffsy CF Pro Race',
    price: 3800,
    location: 'Golden, CO',
    condition: 'Excellent',
    brand: 'YT',
    imageUrl: 'https://images.unsplash.com/photo-1623005329937-eb70fb656e91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '6',
    title: 'Pivot Mach 4 SL Pro XT/XTR',
    price: 5200,
    location: 'Sedona, AZ',
    condition: 'Like New',
    brand: 'Pivot',
    imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
];

// Define interface for the props
interface SearchResultsProps {
  query?: string;
  filters?: {
    priceRange: string;
    type: string;
    brand: string;
    location: string;
  };
}

const SearchResults: React.FC<SearchResultsProps> = () => {
  const { t } = useTranslation();
  const [priceRange, setPriceRange] = React.useState([0, 5000]);
  const [filterVisible, setFilterVisible] = React.useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('searchResults')}</h1>
        <Button 
          variant="outline" 
          onClick={() => setFilterVisible(!filterVisible)}
          className="lg:hidden"
        >
          {filterVisible ? t('hideFilters') : t('showFilters')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className={`${filterVisible ? 'block' : 'hidden'} lg:block`}>
          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">{t('categories')}</h3>
            <div className="space-y-2">
              {['Mountain Bike', 'Road Bike', 'City Bike', 'Electric Bike', 'Kids Bike'].map((category) => (
                <div key={category} className="flex items-center">
                  <input 
                    type="checkbox" 
                    id={category.toLowerCase().replace(' ', '-')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={category.toLowerCase().replace(' ', '-')} className="ml-2 text-sm text-gray-700">
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">{t('priceRange')}</h3>
            <div className="px-2">
              <Slider 
                defaultValue={priceRange} 
                max={5000} 
                step={100}
                onValueChange={setPriceRange}
              />
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Condition Filter */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">{t('condition')}</h3>
            <div className="space-y-2">
              {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((condition) => (
                <div key={condition} className="flex items-center">
                  <input 
                    type="checkbox" 
                    id={condition.toLowerCase().replace(' ', '-')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={condition.toLowerCase().replace(' ', '-')} className="ml-2 text-sm text-gray-700">
                    {condition}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Filters Button */}
          <Button variant="outline" className="w-full">
            {t('resetFilters')}
          </Button>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="grid">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-sm text-gray-500">{bicycles.length} {t('resultsFound')}</span>
              </div>
              <TabsList>
                <TabsTrigger value="grid">{t('grid')}</TabsTrigger>
                <TabsTrigger value="list">{t('list')}</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="grid" className="mt-0">
              <BicycleGrid bicycles={bicycles} />
            </TabsContent>
            
            <TabsContent value="list" className="mt-0">
              {/* List view implementation */}
              <div className="space-y-4">
                {bicycles.map((bicycle) => (
                  <div key={bicycle.id} className="border rounded-lg overflow-hidden flex">
                    <img 
                      src={bicycle.imageUrl} 
                      alt={bicycle.title} 
                      className="w-32 h-32 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-medium">{bicycle.title}</h3>
                      <p className="text-lg font-bold text-marketplace-green">${bicycle.price}</p>
                      <p className="text-sm text-gray-500">{bicycle.location} • {bicycle.condition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
