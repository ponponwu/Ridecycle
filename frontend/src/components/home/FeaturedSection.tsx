
import React from 'react';
import BicycleGrid from '../bicycles/BicycleGrid';
import { BicycleCardProps } from '../bicycles/BicycleCard';

const featuredBicycles: BicycleCardProps[] = [
  {
    id: '1',
    title: 'Specialized Stumpjumper Expert Carbon 29',
    price: 2800,
    location: 'Seattle, WA',
    condition: 'Like New',
    brand: 'Specialized',
    imageUrl: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    isFavorite: true
  },
  {
    id: '2',
    title: 'Trek Emonda SL 6 Disc - Ultegra 2022',
    price: 1950,
    location: 'Portland, OR',
    condition: 'Good',
    brand: 'Trek',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: 'Cannondale SuperSix EVO Carbon Disc Ultegra',
    price: 2200,
    location: 'Denver, CO',
    condition: 'Excellent',
    brand: 'Cannondale',
    imageUrl: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    title: 'Giant Revolt Advanced 2 Gravel Bike',
    price: 1600,
    location: 'San Francisco, CA',
    condition: 'Good',
    brand: 'Giant',
    imageUrl: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    isFavorite: true
  }
];

const FeaturedSection = () => {
  return (
    <div className="container px-4 mx-auto py-8">
      <BicycleGrid 
        bicycles={featuredBicycles} 
        title="Featured Bicycles" 
        viewAllLink="/search?featured=true" 
      />
    </div>
  );
};

export default FeaturedSection;
