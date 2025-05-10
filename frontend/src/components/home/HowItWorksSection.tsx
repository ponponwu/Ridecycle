
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HowItWorksSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            How Pedal Palace Works
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Your trusted platform for buying and selling second-hand bicycles
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-marketplace-blue/10 text-marketplace-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">List Your Bike</h3>
            <p className="text-gray-600">
              Take photos and create a detailed listing for your bicycle. Include all relevant details that buyers would want to know.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-marketplace-green/10 text-marketplace-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Connect with Buyers</h3>
            <p className="text-gray-600">
              Respond to inquiries, answer questions, and arrange meetings with potential buyers interested in your bicycle.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-marketplace-orange/10 text-marketplace-orange">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Complete the Sale</h3>
            <p className="text-gray-600">
              Meet with the buyer to complete the transaction and hand over the bicycle. Mark your listing as sold in your dashboard.
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <Link to="/upload">
            <Button className="px-8 py-6 text-lg bg-marketplace-blue hover:bg-blue-600">
              Start Selling
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
