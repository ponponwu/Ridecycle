# spec/models/bicycle_spec.rb
require 'rails_helper'

RSpec.describe Bicycle, type: :model do
  subject { build(:bicycle) }
  
  describe 'associations' do
    it { should belong_to(:user) }
    it { should belong_to(:brand).optional }
    it { should belong_to(:bicycle_model).optional }
    it { should belong_to(:transmission).optional }
    it { should have_many(:messages).dependent(:destroy) }
    it { should have_many_attached(:photos) }
  end

  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:description) }
    it { should validate_presence_of(:price) }
    it { should validate_presence_of(:location) }
    it { should validate_presence_of(:contact_method) }
    
    it { should validate_numericality_of(:price).is_greater_than(0) }
    it { should validate_length_of(:title).is_at_most(255) }
    it { should validate_length_of(:description).is_at_most(2000) }
  end

  describe 'enums' do
    it { should define_enum_for(:condition).with_values(
      brand_new: 0,
      like_new: 1,
      excellent: 2,
      good: 3,
      fair: 4,
      poor: 5
    )}
    
    it { should define_enum_for(:status).with_values(
      pending: 0,
      available: 1,
      sold: 2,
      draft: 3
    )}
  end

  describe 'scopes' do
    let!(:transmission1) { create(:transmission, name: "Test Transmission #{SecureRandom.hex(4)}") }
    let!(:transmission2) { create(:transmission, name: "Test Transmission #{SecureRandom.hex(4)}") }
    let!(:transmission3) { create(:transmission, name: "Test Transmission #{SecureRandom.hex(4)}") }
    let!(:transmission4) { create(:transmission, name: "Test Transmission #{SecureRandom.hex(4)}") }
    let!(:available_bicycle) { create(:bicycle, status: :available, transmission: transmission1) }
    let!(:sold_bicycle) { create(:bicycle, status: :sold, transmission: transmission2) }
    let!(:excellent_bicycle) { create(:bicycle, condition: :excellent, transmission: transmission3) }
    let!(:road_bicycle) { create(:bicycle, bicycle_type: 'road', transmission: transmission4) }

    it 'returns available bicycles' do
      expect(Bicycle.available).to include(available_bicycle)
      expect(Bicycle.available).not_to include(sold_bicycle)
    end

    it 'returns bicycles by condition' do
      expect(Bicycle.excellent).to include(excellent_bicycle)
    end
  end

  describe 'instance methods' do
    let(:bicycle) { create(:bicycle) }

    describe '#display_price' do
      it 'formats price correctly' do
        bicycle.price = 1234.56
        expect(bicycle.display_price).to eq('$1,234.56')
      end
    end

    describe '#available?' do
      it 'returns true for available bicycles' do
        bicycle.status = :available
        expect(bicycle.available?).to be true
      end

      it 'returns false for sold bicycles' do
        bicycle.status = :sold
        expect(bicycle.available?).to be false
      end
    end

    describe '#seller' do
      it 'returns the associated user' do
        expect(bicycle.seller).to eq(bicycle.user)
      end
    end
  end

  describe 'photo variants' do
    let(:bicycle) { create(:bicycle, :with_photos) }

    # 這些測試需要實際的圖片檔案才能運行
    # describe '#main_webp_photo_variant' do
    #   it 'returns webp variant for main photo' do
    #     expect(bicycle.main_webp_photo_variant(0)).to be_present
    #   end
    # end

    # describe '#thumbnail_webp_photo_variant' do
    #   it 'returns webp variant for thumbnail' do
    #     expect(bicycle.thumbnail_webp_photo_variant(0)).to be_present
    #   end
    # end
  end

  describe 'callbacks' do
    it 'sets default status to pending' do
      bicycle = build(:bicycle, status: nil)
      bicycle.save
      expect(bicycle.status).to eq('pending')
    end
  end

  describe 'search functionality' do
    let!(:trek_bicycle) { create(:bicycle, title: 'Trek Mountain Bike') }
    let!(:specialized_bicycle) { create(:bicycle, title: 'Specialized Road Bike') }

    it 'searches by title' do
      results = Bicycle.where("title ILIKE ?", "%Trek%")
      expect(results).to include(trek_bicycle)
      expect(results).not_to include(specialized_bicycle)
    end
  end
end 