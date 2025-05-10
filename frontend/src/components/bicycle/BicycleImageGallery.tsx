
import React, { useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface BicycleImageGalleryProps {
  images: string[];
  title: string;
}

const BicycleImageGallery = ({ images, title }: BicycleImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div>
      {images.length <= 4 ? (
        <div className="mb-4 aspect-[4/3] overflow-hidden rounded-lg">
          <img 
            src={images[selectedImage]} 
            alt={title} 
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="mb-4 aspect-[4/3] overflow-hidden rounded-lg">
          <Carousel>
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <img 
                    src={image} 
                    alt={`${title} - Image ${index + 1}`} 
                    className="object-cover w-full h-full"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-4">
        {images.slice(0, 4).map((image, index) => (
          <button
            key={index}
            className={`aspect-square rounded-md overflow-hidden border-2 ${
              selectedImage === index ? 'border-marketplace-blue' : 'border-transparent'
            }`}
            onClick={() => setSelectedImage(index)}
          >
            <img
              src={image}
              alt={`${title} - Image ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default BicycleImageGallery;
