
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';
import BicycleImageGallery from '@/components/bicycle/BicycleImageGallery';
import BicycleDetailsHeader from '@/components/bicycle/BicycleDetailsHeader';
import BicycleSpecifications from '@/components/bicycle/BicycleSpecifications';
import SellerInformation from '@/components/bicycle/SellerInformation';
import ContactSellerForm from '@/components/bicycle/ContactSellerForm';
import MakeOfferDialog from '@/components/bicycle/MakeOfferDialog';
import BicycleDescription from '@/components/bicycle/BicycleDescription';

// Sample bicycle data - In a real app, this would come from an API
const bicycleData = {
  id: '1',
  title: 'Specialized Stumpjumper Expert Carbon 29',
  description: 'The Specialized Stumpjumper Expert is the ultimate trail bike. Featuring FACT 11m carbon fiber construction and 140mm of travel front and rear, this bike is built to tackle any trail with ease. The bike is in excellent condition with only minor wear from normal use. FOX suspension, SRAM X01 Eagle drivetrain, and carbon wheels make this a premium mountain bike that\'s ready for your next adventure.',
  price: 2800,
  location: 'Seattle, WA',
  condition: 'Like New',
  brand: 'Specialized',
  model: 'Stumpjumper Expert Carbon 29',
  year: 2021,
  frameSize: 'Large',
  wheelSize: '29"',
  category: 'Mountain Bike',
  images: [
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1623005329937-eb70fb656e91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  ],
  sellerName: 'Michael Thompson',
  sellerRating: 4.8,
  yearsOfUse: 1.5,
  contactInfo: {
    phone: '(206) 555-1234',
    email: 'michael.t@example.com'
  }
};

const BicycleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  
  // In a real app, you would fetch the bicycle data based on the ID
  // For now, we'll just use our sample data
  const bicycle = bicycleData;
  
  return (
    <MainLayout>
      <div className="container px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <nav className="flex mb-5 text-sm text-gray-500">
          <Link to="/" className="hover:text-marketplace-blue">{t('home')}</Link>
          <span className="mx-2">/</span>
          <Link to="/search" className="hover:text-marketplace-blue">{t('search')}</Link>
          <span className="mx-2">/</span>
          <Link to={`/search?category=${bicycle.category}`} className="hover:text-marketplace-blue">{bicycle.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{bicycle.title}</span>
        </nav>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div>
            <BicycleImageGallery 
              images={bicycle.images} 
              title={bicycle.title}
            />
          </div>
          
          {/* Bicycle Details */}
          <div>
            <BicycleDetailsHeader
              title={bicycle.title}
              condition={bicycle.condition}
              brand={bicycle.brand}
              category={bicycle.category}
              price={bicycle.price}
              location={bicycle.location}
              bicycle={bicycle}
            />

            {/* Make Offer Button */}
            <div className="mt-4">
              <MakeOfferDialog bicycleTitle={bicycle.title} bicycleId={id} />
            </div>
            
            {/* Specifications */}
            <BicycleSpecifications
              brand={bicycle.brand}
              model={bicycle.model}
              year={bicycle.year}
              frameSize={bicycle.frameSize}
              wheelSize={bicycle.wheelSize}
              yearsOfUse={bicycle.yearsOfUse}
            />
            
            {/* Seller Information */}
            <SellerInformation
              sellerName={bicycle.sellerName}
              sellerRating={bicycle.sellerRating}
            />
            
            {/* Contact Form */}
            <ContactSellerForm />
          </div>
        </div>
        
        {/* Description */}
        <BicycleDescription description={bicycle.description} />
      </div>
    </MainLayout>
  );
};

export default BicycleDetail;
