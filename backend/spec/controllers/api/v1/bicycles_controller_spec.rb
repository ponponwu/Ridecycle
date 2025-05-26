require 'rails_helper'

RSpec.describe Api::V1::BicyclesController, type: :controller do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:brand) { create(:brand) }
  let!(:bicycle) { create(:bicycle, user: user, brand: brand) }
  let!(:other_bicycle) { create(:bicycle, user: other_user, brand: brand) }

  before do
    # Mock authentication
    allow(controller).to receive(:current_user).and_return(user)
    allow(controller).to receive(:authenticate_user!).and_return(true)
  end

  describe 'GET #index' do
    it 'returns all available bicycles' do
      get :index
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(2)
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
      expect(json_response['data'][0]['attributes']['price']).to eq('2000.0')
    end

    it 'includes pagination metadata' do
      get :index, params: { page: 1, limit: 1 }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['meta']).to include('total_count', 'current_page', 'per_page', 'total_pages')
    end
  end

  describe 'GET #show' do
    it 'returns the bicycle details' do
      get :show, params: { id: bicycle.id }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data']['id']).to eq(bicycle.id.to_s)
      expect(json_response['data']['attributes']['title']).to eq(bicycle.title)
    end

    it 'returns 404 for non-existent bicycle' do
      get :show, params: { id: 99999 }
      
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'GET #me' do
    it 'returns current user bicycles' do
      get :me
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data'].length).to eq(1)
      expect(json_response['data'][0]['id']).to eq(bicycle.id.to_s)
    end
  end

  describe 'GET #featured' do
    before do
      bicycle.update(condition: :excellent, price: 1500)
      other_bicycle.update(condition: :like_new, price: 1000)
    end

    it 'returns featured bicycles' do
      get :featured
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(2)
      
      # Should be ordered by price (ascending)
      prices = json_response['data'].map { |b| b['attributes']['price'].to_f }
      expect(prices).to eq(prices.sort)
    end
  end

  describe 'GET #recently_added' do
    it 'returns recently added bicycles' do
      get :recently_added
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(2)
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
          brand_id: brand.id
        }
      }
    end

    it 'creates a new bicycle with valid params' do
      expect {
        post :create, params: valid_params
      }.to change(Bicycle, :count).by(1)
      
      expect(response).to have_http_status(:created)
      json_response = JSON.parse(response.body)
      expect(json_response['data']['attributes']['title']).to eq('New Test Bike')
    end

    it 'returns errors with invalid params' do
      invalid_params = valid_params.deep_dup
      invalid_params[:bicycle][:title] = ''
      
      post :create, params: invalid_params
      
      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response['success']).to be false
      expect(json_response['errors']).to be_present
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

    it 'updates the bicycle with valid params' do
      patch :update, params: update_params
      
      expect(response).to have_http_status(:ok)
      bicycle.reload
      expect(bicycle.title).to eq('Updated Title')
      expect(bicycle.price).to eq(1500.00)
    end

    it 'returns 404 for non-existent bicycle' do
      patch :update, params: { id: 99999, bicycle: { title: 'Test' } }
      
      expect(response).to have_http_status(:not_found)
    end

    it 'returns 403 for unauthorized update' do
      allow(controller).to receive(:current_user).and_return(other_user)
      
      patch :update, params: update_params
      
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'DELETE #destroy' do
    it 'deletes the bicycle' do
      expect {
        delete :destroy, params: { id: bicycle.id }
      }.to change(Bicycle, :count).by(-1)
      
      expect(response).to have_http_status(:no_content)
    end

    it 'returns 404 for non-existent bicycle' do
      delete :destroy, params: { id: 99999 }
      
      expect(response).to have_http_status(:not_found)
    end

    it 'returns 403 for unauthorized deletion' do
      allow(controller).to receive(:current_user).and_return(other_user)
      
      delete :destroy, params: { id: bicycle.id }
      
      expect(response).to have_http_status(:forbidden)
    end
  end
end 