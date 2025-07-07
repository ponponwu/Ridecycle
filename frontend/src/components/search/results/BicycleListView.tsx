
import React from 'react';
import { Link } from 'react-router-dom';
import { Bicycle } from '../types';

interface BicycleListViewProps {
  bicycles: Bicycle[];
}

const BicycleListView: React.FC<BicycleListViewProps> = ({ bicycles }) => {
  return (
    <div className="space-y-4">
      {bicycles.map((bicycle) => (
        <Link 
          key={bicycle.id} 
          to={`/bicycle/${bicycle.id}`}
          className="block border rounded-lg overflow-hidden flex hover:shadow-md transition-shadow"
        >
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
        </Link>
      ))}
    </div>
  );
};

export default BicycleListView;
