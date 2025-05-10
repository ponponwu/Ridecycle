
import React from 'react';
import BicycleGrid from '../bicycles/BicycleGrid';
import { BicycleCardProps } from '../bicycles/BicycleCard';

const recentBicycles: BicycleCardProps[] = [
  {
    id: '5',
    title: 'Santa Cruz Hightower C S 29" Mountain Bike',
    price: 3200,
    location: 'Austin, TX',
    condition: 'Excellent',
    brand: 'Santa Cruz',
    imageUrl: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '6',
    title: 'Cervelo Aspero GRX 810 1x Gravel Bike',
    price: 2800,
    location: 'New York, NY',
    condition: 'Like New',
    brand: 'Cervelo',
    imageUrl: 'https://images.unsplash.com/photo-1565108150247-3593908b5a2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '7',
    title: 'Kona Process 134 DL 29',
    price: 1850,
    location: 'Los Angeles, CA',
    condition: 'Good',
    brand: 'Kona',
    imageUrl: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    isFavorite: true
  },
  {
    id: '8',
    title: 'Surly Midnight Special Road Plus Bike',
    price: 1400,
    location: 'Chicago, IL',
    condition: 'Good',
    brand: 'Surly',
    imageUrl: 'https://images.unsplash.com/photo-1571333250630-f0893f4912bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  }
];

const RecentlyAddedSection = () => {
  return (
    <div className="container px-4 mx-auto py-8 bg-gray-50 rounded-xl">
      <BicycleGrid 
        bicycles={recentBicycles} 
        title="Recently Added" 
        viewAllLink="/search?sort=newest" 
      />
    </div>
  );
};

export default RecentlyAddedSection;
