
import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface BicycleCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  condition: string;
  brand: string;
  imageUrl: string;
  isFavorite?: boolean;
}

const BicycleCard = ({
  id,
  title,
  price,
  location,
  condition,
  brand,
  imageUrl,
  isFavorite = false,
}: BicycleCardProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden bicycle-card-shadow transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        {/* Image */}
        <Link to={`/bicycle/${id}`} className="block aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {/* Bookmark button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white"
        >
          <Bookmark className={isFavorite ? "h-5 w-5 fill-marketplace-orange text-marketplace-orange" : "h-5 w-5"} />
        </Button>

        {/* Condition tag */}
        <Badge
          variant="secondary"
          className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm text-gray-800"
        >
          {condition}
        </Badge>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg line-clamp-2">
            <Link to={`/bicycle/${id}`} className="hover:text-marketplace-blue transition-colors">
              {title}
            </Link>
          </h3>
          <span className="text-lg font-semibold text-marketplace-green">${price}</span>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
          <span>{brand}</span>
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
};

export default BicycleCard;
