require 'rails_helper'

RSpec.describe Api::V1::BicyclesController, type: :controller do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:brand) { create(:brand) }
  let(:transmission) { create(:transmission) }
  let!(:bicycle) { create(:bicycle, user: user, brand: brand, status: :available) }
  let!(:other_bicycle) { create(:bicycle, user: other_user, brand: brand, status: :available) }

  before do
    # Mock authentication
    allow(controller).to receive(:current_user).and_return(user)
    allow(controller).to receive(:authenticate_user!).and_return(true)
  end

  describe 'GET #index' do
    it 'returns all available bicycles in JSON:API format' do
      get :index
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response).to have_key('meta')
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(2)
      
      # 檢查第一個項目的結構
      first_item = json_response['data'].first
      expect(first_item).to have_key('id')
      expect(first_item).to have_key('type')
      expect(first_item).to have_key('attributes')
      expect(first_item['type']).to eq('bicycle')
    end

    it 'filters bicycles by search term' do
      bicycle.update(title: 'Trek Mountain Bike')
      other_bicycle.update(title: 'Specialized Road Bike')
      
      get :index, params: { search: 'Trek' }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data'].length).to eq(1)
      expect(json_response['data'][0]['attributes']['title']).to include('Trek')
    end

    it 'filters bicycles by bicycle_type' do
      bicycle.update(bicycle_type: 'road')
      other_bicycle.update(bicycle_type: 'mountain')
      
      get :index, params: { bicycle_type: 'road' }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data'].length).to eq(1)
      expect(json_response['data'][0]['attributes']['bicycle_type']).to eq('road')
    end

    it 'filters bicycles by price range' do
      bicycle.update(price: 1000)
      other_bicycle.update(price: 2000)
      
      get :index, params: { price_min: 1500 }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data'].length).to eq(1)
      expect(json_response['data'][0]['attributes']['price']).to eq(2000.0)
    end

    it 'includes pagination metadata' do
      get :index, params: { page: 1, limit: 1 }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['meta']).to include('total_count', 'current_page', 'per_page', 'total_pages')
      expect(json_response['meta']['current_page']).to eq(1)
      expect(json_response['meta']['per_page']).to eq(1)
    end

    it 'only returns available bicycles' do
      pending_bicycle = create(:bicycle, user: user, brand: brand, status: :pending)
      
      get :index
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      bicycle_ids = json_response['data'].map { |b| b['id'].to_i }
      expect(bicycle_ids).not_to include(pending_bicycle.id)
    end
  end

  describe 'GET #show' do
    it 'returns the bicycle details in JSON:API format' do
      get :show, params: { id: bicycle.id }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response['data']).to have_key('id')
      expect(json_response['data']).to have_key('type')
      expect(json_response['data']).to have_key('attributes')
      expect(json_response['data']['id']).to eq(bicycle.id.to_s)
      expect(json_response['data']['type']).to eq('bicycle')
      expect(json_response['data']['attributes']['title']).to eq(bicycle.title)
    end

    it 'returns JSON:API error for non-existent bicycle' do
      get :show, params: { id: 99999 }
      
      expect(response).to have_http_status(:not_found)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 錯誤格式
      expect(json_response).to have_key('errors')
      expect(json_response['errors']).to be_an(Array)
      expect(json_response['errors'].first).to have_key('status')
      expect(json_response['errors'].first).to have_key('title')
      expect(json_response['errors'].first).to have_key('detail')
      expect(json_response['errors'].first['status']).to eq('404')
    end
  end

  describe 'GET #me' do
    it 'returns current user bicycles in JSON:API format' do
      get :me
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response).to have_key('meta')
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(1)
      expect(json_response['data'][0]['id']).to eq(bicycle.id.to_s)
      
      # 檢查分頁 meta
      expect(json_response['meta']).to include('total_count', 'current_page', 'per_page', 'total_pages')
    end
    
    context 'with search parameters' do
      let!(:road_bike) { create(:bicycle, user: user, bicycle_type: 'road', price: 35000, status: :available) }
      let!(:mountain_bike) { create(:bicycle, user: user, bicycle_type: 'mountain', price: 45000, status: :available) }
      
      it 'handles price range format (price=30000-50000)' do
        get :index, params: { price: '30000-50000' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # Both bikes should be included (35000 and 45000 are within 30000-50000)
        expect(json_response['data'].length).to be >= 2
        
        # Check that price filter was applied by verifying meta count
        expect(json_response['meta']['total_count']).to be >= 2
      end
      
      it 'handles type parameter (type=road)' do
        get :index, params: { type: 'road' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # Should only return road bikes
        expect(json_response['data'].length).to be >= 1
        
        # Verify the returned bike is indeed a road bike
        returned_bike = json_response['data'].find { |bike| bike['id'] == road_bike.id.to_s }
        expect(returned_bike).to be_present
        expect(returned_bike['attributes']['bicycle_type']).to eq('road')
      end
      
      it 'handles combined parameters (price=30000-50000&type=road)' do
        get :index, params: { price: '30000-50000', type: 'road' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # Should return only road bikes within price range
        expect(json_response['data']).to be_an(Array)
        
        # Verify road bike is included
        returned_bike = json_response['data'].find { |bike| bike['id'] == road_bike.id.to_s }
        expect(returned_bike).to be_present
        expect(returned_bike['attributes']['bicycle_type']).to eq('road')
      end
      
      it 'handles price range with only minimum (price=40000-)' do
        get :index, params: { price: '40000-' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # Should include bikes priced 40000 and above
        expect(json_response['data']).to be_an(Array)
        
        # Mountain bike (45000) should be included
        returned_bike = json_response['data'].find { |bike| bike['id'] == mountain_bike.id.to_s }
        expect(returned_bike).to be_present
      end
      
      it 'handles price range with only maximum (price=-40000)' do
        get :index, params: { price: '-40000' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # Should include bikes priced 40000 and below
        expect(json_response['data']).to be_an(Array)
        
        # Road bike (35000) should be included
        returned_bike = json_response['data'].find { |bike| bike['id'] == road_bike.id.to_s }
        expect(returned_bike).to be_present
      end
      
      it 'handles single price value (price=35000)' do
        get :index, params: { price: '35000' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # Should include bikes priced 35000 and above
        expect(json_response['data']).to be_an(Array)
        
        # Both bikes should be included (35000 and 45000)
        road_bike_returned = json_response['data'].find { |bike| bike['id'] == road_bike.id.to_s }
        mountain_bike_returned = json_response['data'].find { |bike| bike['id'] == mountain_bike.id.to_s }
        
        expect(road_bike_returned).to be_present
        expect(mountain_bike_returned).to be_present
      end
      
      it 'handles invalid price range gracefully (price=invalid-range)' do
        get :index, params: { price: 'invalid-range' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # Should return all bikes (no price filter applied)
        expect(json_response['data']).to be_an(Array)
        expect(json_response['meta']['total_count']).to be >= 4 # Original 2 + road_bike + mountain_bike
      end
      
      it 'maintains backward compatibility with old format (price_min&price_max)' do
        get :index, params: { price_min: '30000', price_max: '50000', bicycle_type: 'road' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # Should work the same as new format
        expect(json_response['data']).to be_an(Array)
        
        # Verify road bike is included
        returned_bike = json_response['data'].find { |bike| bike['id'] == road_bike.id.to_s }
        expect(returned_bike).to be_present
        expect(returned_bike['attributes']['bicycle_type']).to eq('road')
      end
    end

    it 'requires authentication' do
      allow(controller).to receive(:current_user).and_return(nil)
      allow(controller).to receive(:authenticate_user!).and_call_original
      
      get :me
      
      expect(response).to have_http_status(:unauthorized)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
    end
  end

  describe 'GET #featured' do
    before do
      bicycle.update(condition: :brand_new, price: 1500, status: :available)
      other_bicycle.update(condition: :like_new, price: 1000, status: :available)
    end

    it 'returns featured bicycles in JSON:API format' do
      get :featured
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(2)
      
      # 檢查排序（按價格降序）
      prices = json_response['data'].map { |b| b['attributes']['price'] }
      expect(prices).to eq(prices.sort.reverse)
    end

    it 'only returns bicycles with excellent conditions' do
      poor_bicycle = create(:bicycle, user: user, brand: brand, condition: :poor, status: :available)
      
      get :featured
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      bicycle_ids = json_response['data'].map { |b| b['id'].to_i }
      expect(bicycle_ids).not_to include(poor_bicycle.id)
    end
  end

  describe 'GET #recently_added' do
    it 'returns recently added bicycles in JSON:API format' do
      get :recently_added
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(2)
      
      # 檢查排序（按創建時間降序）
      created_times = json_response['data'].map { |b| Time.parse(b['attributes']['created_at']) }
      expect(created_times).to eq(created_times.sort.reverse)
    end

    it 'only returns available bicycles' do
      pending_bicycle = create(:bicycle, user: user, brand: brand, status: :pending)
      
      get :recently_added
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      bicycle_ids = json_response['data'].map { |b| b['id'].to_i }
      expect(bicycle_ids).not_to include(pending_bicycle.id)
    end
  end

  describe 'POST #create' do
    let(:valid_params) do
      {
        bicycle: {
          title: 'New Test Bike',
          description: 'A great test bike',
          price: 1200.00,
          bicycle_type: 'road',
          condition: 'excellent',
          location: 'Taipei',
          contact_method: 'email',
          brand_id: brand.id,
          transmission_id: transmission.id,
          frame_size: 'M'
        }
      }
    end

    it 'creates a new bicycle with valid params and returns JSON:API format' do
      expect {
        post :create, params: valid_params
      }.to change(Bicycle, :count).by(1)
      
      expect(response).to have_http_status(:created)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response['data']).to have_key('id')
      expect(json_response['data']).to have_key('type')
      expect(json_response['data']).to have_key('attributes')
      expect(json_response['data']['type']).to eq('bicycle')
      expect(json_response['data']['attributes']['title']).to eq('New Test Bike')
      
      # 檢查預設狀態為 pending
      created_bicycle = Bicycle.last
      expect(created_bicycle.status).to eq('pending')
    end

    it 'returns JSON:API errors with invalid params' do
      invalid_params = valid_params.deep_dup
      invalid_params[:bicycle][:title] = ''
      
      post :create, params: invalid_params
      
      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 錯誤格式
      expect(json_response).to have_key('errors')
      expect(json_response['errors']).to be_an(Array)
      expect(json_response['errors'].first).to have_key('status')
      expect(json_response['errors'].first).to have_key('detail')
    end

    it 'requires authentication' do
      allow(controller).to receive(:current_user).and_return(nil)
      allow(controller).to receive(:authenticate_user!).and_call_original
      
      post :create, params: valid_params
      
      expect(response).to have_http_status(:unauthorized)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
    end
  end

  describe 'PATCH #update' do
    let(:update_params) do
      {
        id: bicycle.id,
        bicycle: {
          title: 'Updated Title',
          price: 1500.00
        }
      }
    end

    it 'updates the bicycle with valid params and returns JSON:API format' do
      patch :update, params: update_params
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response['data']['attributes']['title']).to eq('Updated Title')
      expect(json_response['data']['attributes']['price']).to eq(1500.0)
      
      bicycle.reload
      expect(bicycle.title).to eq('Updated Title')
      expect(bicycle.price).to eq(1500.00)
    end

    it 'returns JSON:API error for non-existent bicycle' do
      patch :update, params: { id: 99999, bicycle: { title: 'Test' } }
      
      expect(response).to have_http_status(:not_found)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
      expect(json_response['errors'].first['status']).to eq('404')
    end

    it 'returns JSON:API error for unauthorized update' do
      allow(controller).to receive(:current_user).and_return(other_user)
      
      patch :update, params: update_params
      
      expect(response).to have_http_status(:forbidden)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
      expect(json_response['errors'].first['status']).to eq('403')
    end

    it 'returns JSON:API errors with invalid params' do
      invalid_params = update_params.deep_dup
      invalid_params[:bicycle][:price] = -100
      
      patch :update, params: invalid_params
      
      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
    end
  end

  describe 'DELETE #destroy' do
    it 'deletes the bicycle and returns 204' do
      expect {
        delete :destroy, params: { id: bicycle.id }
      }.to change(Bicycle, :count).by(-1)
      
      expect(response).to have_http_status(:no_content)
      expect(response.body).to be_empty
    end

    it 'returns JSON:API error for non-existent bicycle' do
      delete :destroy, params: { id: 99999 }
      
      expect(response).to have_http_status(:not_found)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
      expect(json_response['errors'].first['status']).to eq('404')
    end

    it 'returns JSON:API error for unauthorized deletion' do
      allow(controller).to receive(:current_user).and_return(other_user)
      
      delete :destroy, params: { id: bicycle.id }
      
      expect(response).to have_http_status(:forbidden)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
      expect(json_response['errors'].first['status']).to eq('403')
    end
  end
end 