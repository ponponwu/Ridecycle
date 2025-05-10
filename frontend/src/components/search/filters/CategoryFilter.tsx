
import React from 'react';
import { useTranslation } from 'react-i18next';

interface CategoryFilterProps {
  selectedCategories: string[];
  toggleCategoryFilter: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategories,
  toggleCategoryFilter
}) => {
  const { t } = useTranslation();
  
  const categories = ['Mountain Bike', 'Road Bike', 'City Bike', 'Electric Bike', 'Kids Bike'];
  
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-3">{t('categories')}</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category} className="flex items-center">
            <input 
              type="checkbox" 
              id={category.toLowerCase().replace(' ', '-')}
              checked={selectedCategories.includes(category)}
              onChange={() => toggleCategoryFilter(category)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={category.toLowerCase().replace(' ', '-')} className="ml-2 text-sm text-gray-700">
              {category}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
