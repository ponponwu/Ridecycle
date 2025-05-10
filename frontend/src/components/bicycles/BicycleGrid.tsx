
import React from 'react';
import BicycleCard, { BicycleCardProps } from './BicycleCard';

interface BicycleGridProps {
  bicycles: BicycleCardProps[];
  title?: string;
  viewAllLink?: string;
}

const BicycleGrid = ({ bicycles, title, viewAllLink }: BicycleGridProps) => {
  return (
    <section className="py-8">
      {title && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {viewAllLink && (
            <a href={viewAllLink} className="text-marketplace-blue hover:underline">
              View all
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bicycles.map((bike) => (
          <BicycleCard key={bike.id} {...bike} />
        ))}
      </div>
    </section>
  );
};

export default BicycleGrid;
