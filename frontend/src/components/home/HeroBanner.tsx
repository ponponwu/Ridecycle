
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HeroBanner = () => {
  const { t } = useTranslation();
  
  const bikeCategories = [
    { name: "Mountain Bikes", type: "Mountain Bike" },
    { name: "Road Bikes", type: "Road Bike" },
    { name: "Hybrid Bikes", type: "Hybrid Bike" },
    { name: "City Bikes", type: "City Bike" },
    { name: "Electric Bikes", type: "Electric Bike" },
    { name: "Kids Bikes", type: "Kids Bike" },
    { name: "BMX", type: "BMX" }
  ];

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white">
      <div className="container px-4 py-12 mx-auto sm:py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center max-w-lg">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              {t('findPerfectBike')} <span className="text-marketplace-blue">{t('ride')}</span>
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              {t('heroBannerDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to="/search">
                <Button className="bg-marketplace-blue hover:bg-blue-600 text-white px-8 py-6 text-lg">
                  <Search className="mr-2 h-5 w-5" />
                  {t('browseBikes')}
                </Button>
              </Link>
              <Link to="/upload">
                <Button variant="outline" className="px-8 py-6 text-lg">
                  {t('sellYourBike')}
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-marketplace-blue/30 to-transparent z-10"></div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1578167635648-9e3e439ccb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
              alt="Mountain bike on a trail"
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        </div>
      </div>
      
      {/* Category Pills */}
      <div className="container px-4 pb-8 mx-auto">
        <div className="flex flex-nowrap overflow-x-auto gap-2 py-2 pb-4 no-scrollbar">
          {bikeCategories.map((category) => (
            <Link 
              key={category.type} 
              to={`/search?type=${encodeURIComponent(category.type)}`}
            >
              <Button variant="outline" className="rounded-full whitespace-nowrap">
                {category.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
