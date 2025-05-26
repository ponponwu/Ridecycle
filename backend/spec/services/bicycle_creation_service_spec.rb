# spec/services/bicycle_creation_service_spec.rb
require 'rails_helper'

RSpec.describe BicycleCreationService, type: :service do
  let(:user) { create(:user) }
  let(:brand) { create(:brand) }
  let(:bicycle_params) do
    ActionController::Parameters.new({
      title: 'Test Bicycle',
      description: 'A great test bicycle',
      price: 1200.00,
      bicycle_type: 'road',
      condition: 'excellent',
      location: 'Taipei',
      contact_method: 'email',
      brand_id: brand.id,
      specifications: '{"weight": "10kg", "material": "carbon"}'
    })
  end

  describe '#initialize' do
    it 'sets the user and bicycle_params' do
      service = described_class.new(user, bicycle_params)
      
      expect(service.instance_variable_get(:@user)).to eq(user)
      expect(service.instance_variable_get(:@bicycle_params)).to eq(bicycle_params)
    end

    it 'sets photo_files when provided' do
      photo_files = ['photo1.jpg', 'photo2.jpg']
      service = described_class.new(user, bicycle_params, photo_files)
      
      expect(service.instance_variable_get(:@photo_files)).to eq(photo_files)
    end
  end

  describe '#valid?' do
    it 'returns true when user and bicycle_params are present' do
      service = described_class.new(user, bicycle_params)
      
      expect(service.valid?).to be true
    end

    it 'returns false when user is nil' do
      service = described_class.new(nil, bicycle_params)
      
      expect(service.valid?).to be false
    end

    it 'returns false when bicycle_params is nil' do
      service = described_class.new(user, nil)
      
      expect(service.valid?).to be false
    end
  end

  describe '#call' do
    let(:service) { described_class.new(user, bicycle_params) }

    it 'creates a new bicycle' do
      expect {
        service.call
      }.to change(Bicycle, :count).by(1)
    end

    it 'returns the created bicycle' do
      bicycle = service.call
      
      expect(bicycle).to be_a(Bicycle)
      expect(bicycle.persisted?).to be true
      expect(bicycle.title).to eq('Test Bicycle')
      expect(bicycle.user).to eq(user)
    end

    it 'processes JSON specifications correctly' do
      bicycle = service.call
      
      expect(bicycle.specifications).to eq({
        'weight' => '10kg',
        'material' => 'carbon'
      })
    end

    it 'handles invalid JSON specifications gracefully' do
      bicycle_params[:specifications] = 'invalid json'
      bicycle = service.call
      
      expect(bicycle.specifications).to eq({})
    end

    context 'with photo files' do
      let(:photo_files) { [fixture_file_upload('spec/fixtures/test_image.jpg', 'image/jpeg')] }
      let(:service) { described_class.new(user, bicycle_params, photo_files) }

      # This test would require actual image files in spec/fixtures
      # it 'attaches photos to the bicycle' do
      #   bicycle = service.call
      #   
      #   expect(bicycle.photos.attached?).to be true
      #   expect(bicycle.photos.count).to eq(1)
      # end
    end

    context 'when bicycle validation fails' do
      before do
        bicycle_params[:title] = '' # Invalid title
      end

      it 'raises ActiveRecord::RecordInvalid' do
        expect {
          service.call
        }.to raise_error(ActiveRecord::RecordInvalid)
      end

      it 'does not create a bicycle' do
        expect {
          begin
            service.call
          rescue ActiveRecord::RecordInvalid
            # Ignore the error for count check
          end
        }.not_to change(Bicycle, :count)
      end

      it 'logs the error' do
        allow(Rails.logger).to receive(:error)
        
        begin
          service.call
        rescue ActiveRecord::RecordInvalid
          # Expected error
        end
        
        expect(Rails.logger).to have_received(:error).with(/BicycleCreationService failed/)
      end
    end

    context 'within transaction' do
      it 'rolls back on error' do
        allow_any_instance_of(Bicycle).to receive(:save!).and_raise(ActiveRecord::RecordInvalid.new(Bicycle.new))
        
        expect {
          begin
            service.call
          rescue ActiveRecord::RecordInvalid
            # Expected error
          end
        }.not_to change(Bicycle, :count)
      end
    end
  end
end 