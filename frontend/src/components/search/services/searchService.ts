
import { Bicycle } from '../types';

// Mock data for the bicycles
const mockData: Bicycle[] = [
  {
    id: '1',
    title: 'Specialized Stumpjumper Expert Carbon',
    price: 2800,
    location: 'Seattle, WA',
    condition: 'Like New',
    brand: 'Specialized',
    type: 'Mountain Bike',
    imageUrl: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'Trek Fuel EX 8 29',
    price: 1900,
    location: 'Portland, OR',
    condition: 'Good',
    brand: 'Trek',
    type: 'Mountain Bike',
    imageUrl: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'Canyon Neuron CF SL 8',
    price: 3200,
    location: 'Denver, CO',
    condition: 'Excellent',
    brand: 'Canyon',
    type: 'Mountain Bike',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    title: 'Santa Cruz Hightower LT Carbon',
    price: 4500,
    location: 'Boulder, CO',
    condition: 'Like New',
    brand: 'Santa Cruz',
    type: 'Mountain Bike',
    imageUrl: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    title: 'Bianchi Road Bike',
    price: 3800,
    location: 'Golden, CO',
    condition: 'Excellent',
    brand: 'Bianchi',
    type: 'Road Bike',
    imageUrl: 'https://images.unsplash.com/photo-1623005329937-eb70fb656e91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '6',
    title: 'Cannondale City Bike',
    price: 5200,
    location: 'Sedona, AZ',
    condition: 'Like New',
    brand: 'Cannondale',
    type: 'City Bike',
    imageUrl: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '7',
    title: 'Giant Electric Bike',
    price: 2500,
    location: 'San Francisco, CA',
    condition: 'Good',
    brand: 'Giant',
    type: 'Electric Bike',
    imageUrl: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  },
];

// Filter function to filter bicycles based on search parameters and selected filters
export const fetchBicycles = async (
  searchParams: URLSearchParams,
  selectedFilters: {
    categories: string[];
    conditions: string[];
    priceMin: number;
    priceMax: number;
  }
) => {
  console.log('Fetching bicycles with filters:', {
    query: searchParams.get('q'),
    type: searchParams.get('type'),
    brand: searchParams.get('brand'),
    location: searchParams.get('location'),
    price: searchParams.get('price'),
    categories: selectedFilters.categories,
    conditions: selectedFilters.conditions,
    priceMin: selectedFilters.priceMin,
    priceMax: selectedFilters.priceMax
  });

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter bicycles based on the parameters
  let filteredBicycles = [...mockData];

  // Apply URL search params filters
  const queryParam = searchParams.get('q');
  if (queryParam) {
    filteredBicycles = filteredBicycles.filter(bike => 
      bike.title.toLowerCase().includes(queryParam.toLowerCase()) || 
      bike.brand.toLowerCase().includes(queryParam.toLowerCase())
    );
  }

  const typeParam = searchParams.get('type');
  if (typeParam) {
    filteredBicycles = filteredBicycles.filter(bike => 
      bike.type === typeParam
    );
  }

  const brandParam = searchParams.get('brand');
  if (brandParam) {
    filteredBicycles = filteredBicycles.filter(bike => 
      bike.brand.toLowerCase() === brandParam.toLowerCase()
    );
  }

  const locationParam = searchParams.get('location');
  if (locationParam) {
    filteredBicycles = filteredBicycles.filter(bike => 
      bike.location.includes(locationParam)
    );
  }

  // Apply selected filters from UI
  if (selectedFilters.categories.length > 0) {
    filteredBicycles = filteredBicycles.filter(bike => 
      selectedFilters.categories.includes(bike.type)
    );
  }

  if (selectedFilters.conditions.length > 0) {
    filteredBicycles = filteredBicycles.filter(bike => 
      selectedFilters.conditions.includes(bike.condition)
    );
  }

  // Apply price range filter
  filteredBicycles = filteredBicycles.filter(bike => 
    bike.price >= selectedFilters.priceMin && bike.price <= selectedFilters.priceMax
  );

  return filteredBicycles;
};
