
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HeroBanner from '@/components/home/HeroBanner';
import SearchSection from '@/components/home/SearchSection';
import FeaturedSection from '@/components/home/FeaturedSection';
import RecentlyAddedSection from '@/components/home/RecentlyAddedSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import TestimonialSection from '@/components/home/TestimonialSection';
import CallToAction from '@/components/home/CallToAction';

const Index = () => {
  return (
    <MainLayout>
      <HeroBanner />
      <SearchSection />
      <FeaturedSection />
      <HowItWorksSection />
      <RecentlyAddedSection />
      <TestimonialSection />
      <CallToAction />
    </MainLayout>
  );
};

export default Index;
