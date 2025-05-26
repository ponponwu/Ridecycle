
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const SearchSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    priceRange: '',
    type: '',
    brand: '',
    location: ''
  });
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchInput) params.append('q', searchInput);
    if (filters.priceRange) params.append('price', filters.priceRange);
    if (filters.type) params.append('type', filters.type);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.location) params.append('location', filters.location);
    
    navigate(`/search?${params.toString()}`);
  };
  
  return (
    <section className="py-10 bg-gray-50">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 md:text-3xl">
            {t('findPerfectBike')}
          </h2>
          
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full h-14 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent search-input"
                />
              </div>
              <Button type="submit" className="h-14 bg-marketplace-blue hover:bg-blue-600 px-8">
                <Search className="mr-2 h-5 w-5" />
                {t('search')}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('priceRange')}
                </label>
                <select 
                  name="priceRange"
                  value={filters.priceRange}
                  onChange={handleFilterChange}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
                >
                  <option value="">{t('anyPrice')}</option>
                  <option value="0-500">$0 - $500</option>
                  <option value="500-1000">$500 - $1000</option>
                  <option value="1000-2500">$1000 - $2500</option>
                  <option value="2500+">$2500+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bicycleType')}
                </label>
                <select 
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
                >
                  <option value="">{t('allTypes')}</option>
                  <option value="Mountain Bike">Mountain</option>
                  <option value="Road Bike">Road</option>
                  <option value="Hybrid Bike">Hybrid</option>
                  <option value="City Bike">City</option>
                  <option value="Electric Bike">Electric</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('brand')}
                </label>
                <select 
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
                >
                  <option value="">{t('allBrands')}</option>
                  <option value="specialized">Specialized</option>
                  <option value="trek">Trek</option>
                  <option value="giant">Giant</option>
                  <option value="cannondale">Cannondale</option>
                  <option value="scott">Scott</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('location')}
                </label>
                <select 
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
                >
                  <option value="">{t('allLocations')}</option>
                  <option value="nyc">New York</option>
                  <option value="la">Los Angeles</option>
                  <option value="chicago">Chicago</option>
                  <option value="austin">Austin</option>
                  <option value="seattle">Seattle</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="link" className="text-marketplace-blue" type="submit">
                {t('advancedSearchOptions')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
