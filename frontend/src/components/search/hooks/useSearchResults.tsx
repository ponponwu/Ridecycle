
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchBicycles } from '../services/searchService';
import { Bicycle, SearchFilters } from '../types';

export const useSearchResults = () => {
  const [searchParams] = useSearchParams();
  const [bicycles, setBicycles] = useState<Bicycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<SearchFilters>({
    categories: [],
    conditions: [],
    priceMin: 0,
    priceMax: 5000
  });

  // Toggle filter visibility on mobile
  const toggleFilterVisibility = () => {
    setFilterVisible(prev => !prev);
  };

  // Toggle category filter
  const toggleCategoryFilter = (category: string) => {
    setSelectedFilters(prev => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category]
        };
      }
    });
  };

  // Toggle condition filter
  const toggleConditionFilter = (condition: string) => {
    setSelectedFilters(prev => {
      if (prev.conditions.includes(condition)) {
        return {
          ...prev,
          conditions: prev.conditions.filter(c => c !== condition)
        };
      } else {
        return {
          ...prev,
          conditions: [...prev.conditions, condition]
        };
      }
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedFilters({
      categories: [],
      conditions: [],
      priceMin: 0,
      priceMax: 5000
    });
    setPriceRange([0, 5000]);
  };

  // Update price range when slider value changes
  useEffect(() => {
    setSelectedFilters(prev => ({
      ...prev,
      priceMin: priceRange[0],
      priceMax: priceRange[1]
    }));
  }, [priceRange]);

  // Fetch bicycles when search params or selected filters change
  useEffect(() => {
    const getBicycles = async () => {
      setLoading(true);
      try {
        const results = await fetchBicycles(searchParams, selectedFilters);
        setBicycles(results);
      } catch (error) {
        console.error('Error fetching bicycles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getBicycles();
  }, [searchParams, selectedFilters]);

  return {
    bicycles,
    loading,
    priceRange,
    setPriceRange,
    filterVisible,
    toggleFilterVisibility,
    selectedFilters,
    toggleCategoryFilter,
    toggleConditionFilter,
    resetFilters
  };
};
