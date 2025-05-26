# spec/services/bicycle_search_service_spec.rb
require 'rails_helper'

RSpec.describe BicycleSearchService, type: :service do
  let(:user) { create(:user) }
  let(:brand1) { create(:brand, name: 'Trek') }
  let(:brand2) { create(:brand, name: 'Specialized') }
  
  let!(:road_bike) do
    create(:bicycle, 
      title: 'Trek Road Bike',
      bicycle_type: 'road',
      condition: 'excellent',
      price: 1500,
      location: 'Taipei',
      brand: brand1,
      user: user
    )
  end
  
  let!(:mountain_bike) do
    create(:bicycle,
      title: 'Specialized Mountain Bike',
      bicycle_type: 'mountain',
      condition: 'good',
      price: 1200,
      location: 'Kaohsiung',
      brand: brand2,
      user: user
    )
  end
  
  let!(:sold_bike) do
    create(:bicycle,
      title: 'Sold Bike',
      status: 'sold',
      user: user
    )
  end

  describe '#initialize' do
    it 'sets the params and initializes query' do
      params = { search: 'test' }
      service = described_class.new(params)
      
      expect(service.instance_variable_get(:@params)).to eq(params)
      expect(service.instance_variable_get(:@query)).to be_a(ActiveRecord::Relation)
    end

    it 'includes necessary associations' do
      service = described_class.new({})
      query = service.instance_variable_get(:@query)
      
      expect(query.includes_values).to include(:user, :brand)
    end
  end

  describe '#call' do
    context 'without filters' do
      it 'returns all available bicycles' do
        service = described_class.new({})
        result = service.call
        
        expect(result[:bicycles].count).to eq(2) # Excludes sold bike
        expect(result[:total_count]).to eq(2)
        expect(result[:current_page]).to eq(1)
        expect(result[:per_page]).to eq(20)
      end
    end

    context 'with search filter' do
      it 'filters by title' do
        service = described_class.new({ search: 'Trek' })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        expect(result[:bicycles].first.title).to include('Trek')
      end

      it 'filters by description' do
        road_bike.update(description: 'Great for racing')
        service = described_class.new({ search: 'racing' })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        expect(result[:bicycles].first).to eq(road_bike)
      end

      it 'is case insensitive' do
        service = described_class.new({ search: 'trek' })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        expect(result[:bicycles].first.title).to include('Trek')
      end
    end

    context 'with bicycle_type filter' do
      it 'filters by single bicycle type' do
        service = described_class.new({ bicycle_type: 'road' })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        expect(result[:bicycles].first.bicycle_type).to eq('road')
      end

      it 'filters by multiple bicycle types' do
        service = described_class.new({ bicycle_type: ['road', 'mountain'] })
        result = service.call
        
        expect(result[:bicycles].count).to eq(2)
      end
    end

    context 'with condition filter' do
      it 'filters by single condition' do
        service = described_class.new({ condition: 'excellent' })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        expect(result[:bicycles].first.condition).to eq('excellent')
      end

      it 'filters by multiple conditions' do
        service = described_class.new({ condition: ['excellent', 'good'] })
        result = service.call
        
        expect(result[:bicycles].count).to eq(2)
      end
    end

    context 'with price range filter' do
      it 'filters by minimum price' do
        service = described_class.new({ price_min: 1300 })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        expect(result[:bicycles].first.price).to be >= 1300
      end

      it 'filters by maximum price' do
        service = described_class.new({ price_max: 1300 })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        expect(result[:bicycles].first.price).to be <= 1300
      end

      it 'filters by price range' do
        service = described_class.new({ price_min: 1100, price_max: 1400 })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        expect(result[:bicycles].first.price).to be_between(1100, 1400)
      end

      it 'ignores zero maximum price' do
        service = described_class.new({ price_max: 0 })
        result = service.call
        
        expect(result[:bicycles].count).to eq(2) # No filtering applied
      end
    end

    context 'with location filter' do
      it 'filters by location' do
        service = described_class.new({ location: 'Taipei' })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        expect(result[:bicycles].first.location).to include('Taipei')
      end

      it 'is case insensitive' do
        service = described_class.new({ location: 'taipei' })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
      end
    end

    context 'with brand filter' do
      it 'filters by brand name' do
        service = described_class.new({ brand: 'Trek' })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        expect(result[:bicycles].first.brand.name).to eq('Trek')
      end

      it 'is case insensitive' do
        service = described_class.new({ brand: 'trek' })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
      end
    end

    context 'with status filter' do
      it 'defaults to available status' do
        service = described_class.new({})
        result = service.call
        
        expect(result[:bicycles].all? { |b| b.status == 'available' }).to be true
      end

      it 'can filter by specific status' do
        service = described_class.new({ status: 'sold' })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        expect(result[:bicycles].first.status).to eq('sold')
      end
    end

    context 'with sorting' do
      it 'sorts by price low to high' do
        service = described_class.new({ sort: 'price_low' })
        result = service.call
        
        prices = result[:bicycles].map(&:price)
        expect(prices).to eq(prices.sort)
      end

      it 'sorts by price high to low' do
        service = described_class.new({ sort: 'price_high' })
        result = service.call
        
        prices = result[:bicycles].map(&:price)
        expect(prices).to eq(prices.sort.reverse)
      end

      it 'sorts by newest (default)' do
        service = described_class.new({ sort: 'newest' })
        result = service.call
        
        created_ats = result[:bicycles].map(&:created_at)
        expect(created_ats).to eq(created_ats.sort.reverse)
      end

      it 'defaults to newest when sort is not specified' do
        service = described_class.new({})
        result = service.call
        
        created_ats = result[:bicycles].map(&:created_at)
        expect(created_ats).to eq(created_ats.sort.reverse)
      end
    end

    context 'with pagination' do
      it 'paginates results' do
        service = described_class.new({ page: 1, limit: 1 })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        expect(result[:current_page]).to eq(1)
        expect(result[:per_page]).to eq(1)
        expect(result[:total_pages]).to eq(2)
      end

      it 'returns second page' do
        service = described_class.new({ page: 2, limit: 1 })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        expect(result[:current_page]).to eq(2)
      end

      it 'defaults to page 1 and limit 20' do
        service = described_class.new({})
        result = service.call
        
        expect(result[:current_page]).to eq(1)
        expect(result[:per_page]).to eq(20)
      end
    end

    context 'with combined filters' do
      it 'applies multiple filters correctly' do
        service = described_class.new({
          search: 'Trek',
          bicycle_type: 'road',
          condition: 'excellent',
          price_min: 1000,
          price_max: 2000
        })
        result = service.call
        
        expect(result[:bicycles].count).to eq(1)
        bicycle = result[:bicycles].first
        expect(bicycle.title).to include('Trek')
        expect(bicycle.bicycle_type).to eq('road')
        expect(bicycle.condition).to eq('excellent')
        expect(bicycle.price).to be_between(1000, 2000)
      end
    end
  end
end 