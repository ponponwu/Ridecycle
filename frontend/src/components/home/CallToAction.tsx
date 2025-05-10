
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-marketplace-blue to-blue-700 text-white">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to Find Your Next Bicycle?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Join our community of cycling enthusiasts and start browsing thousands of second-hand bikes today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link to="/search">
              <Button className="px-8 py-6 text-lg bg-white text-marketplace-blue hover:bg-gray-100">
                Browse Bicycles
              </Button>
            </Link>
            <Link to="/upload">
              <Button variant="outline" className="px-8 py-6 text-lg border-white text-white hover:bg-white/10">
                Sell Your Bike
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
