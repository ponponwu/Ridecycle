require 'rails_helper'

RSpec.describe Api::V1::BrandsController, type: :controller do
  let!(:brand1) { create(:brand, name: 'Trek') }
  let!(:brand2) { create(:brand, name: 'Specialized') }
  let!(:brand3) { create(:brand, name: 'Giant') }

  before do
    request.env["HTTP_ACCEPT"] = 'application/json'
    request.env["CONTENT_TYPE"] = 'application/json'
  end

  describe 'GET #index' do
    it 'returns all brands in JSON:API format' do
      get :index
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(3)
      
      # 檢查第一個項目的結構
      first_item = json_response['data'].first
      expect(first_item).to have_key('id')
      expect(first_item).to have_key('type')
      expect(first_item).to have_key('attributes')
      expect(first_item['type']).to eq('brand')
    end

    it 'orders brands by name' do
      get :index
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      brand_names = json_response['data'].map { |b| b['attributes']['name'] }
      expect(brand_names).to eq(['Giant', 'Specialized', 'Trek'])
    end

    it 'filters brands by search query' do
      get :index, params: { q: 'tre' }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      expect(json_response['data'].length).to eq(1)
      expect(json_response['data'][0]['attributes']['name']).to eq('Trek')
    end

    it 'performs case-insensitive search' do
      get :index, params: { q: 'TREK' }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      expect(json_response['data'].length).to eq(1)
      expect(json_response['data'][0]['attributes']['name']).to eq('Trek')
    end

    it 'returns empty array when no brands match search' do
      get :index, params: { q: 'nonexistent' }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(0)
    end

    it 'handles empty search query' do
      get :index, params: { q: '' }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      expect(json_response['data'].length).to eq(3)
    end

    it 'handles whitespace-only search query' do
      get :index, params: { q: '   ' }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      expect(json_response['data'].length).to eq(3)
    end
  end

  describe 'GET #show' do
    it 'returns the brand details in JSON:API format' do
      get :show, params: { id: brand1.id }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response['data']).to have_key('id')
      expect(json_response['data']).to have_key('type')
      expect(json_response['data']).to have_key('attributes')
      expect(json_response['data']['type']).to eq('brand')
      expect(json_response['data']['id']).to eq(brand1.id.to_s)
      expect(json_response['data']['attributes']['name']).to eq('Trek')
    end

    it 'returns JSON:API error for non-existent brand' do
      get :show, params: { id: 99999 }
      
      expect(response).to have_http_status(:not_found)
      json_response = JSON.parse(response.body)
      
      expect(json_response).to have_key('errors')
      expect(json_response['errors']).to be_an(Array)
      expect(json_response['errors'].first['status']).to eq('404')
    end
  end

  describe 'POST #create' do
    let(:valid_params) do
      {
        brand: {
          name: 'Cannondale'
        }
      }
    end

    it 'creates a new brand and returns JSON:API format' do
      expect {
        post :create, params: valid_params
      }.to change(Brand, :count).by(1)
      
      expect(response).to have_http_status(:created)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response['data']).to have_key('id')
      expect(json_response['data']).to have_key('type')
      expect(json_response['data']).to have_key('attributes')
      expect(json_response['data']['type']).to eq('brand')
      expect(json_response['data']['attributes']['name']).to eq('Cannondale')
    end

    it 'normalizes brand name to titleize' do
      params = valid_params.deep_dup
      params[:brand][:name] = 'cannondale'
      
      post :create, params: params
      
      expect(response).to have_http_status(:created)
      created_brand = Brand.last
      expect(created_brand.name).to eq('Cannondale')
    end

    it 'returns existing brand if name already exists' do
      existing_brand = create(:brand, name: 'Cannondale')
      
      expect {
        post :create, params: valid_params
      }.not_to change(Brand, :count)
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      expect(json_response['data']['id']).to eq(existing_brand.id.to_s)
      expect(json_response['data']['attributes']['name']).to eq('Cannondale')
    end

    it 'performs case-insensitive duplicate check' do
      create(:brand, name: 'Cannondale')
      
      params = valid_params.deep_dup
      params[:brand][:name] = 'CANNONDALE'
      
      expect {
        post :create, params: params
      }.not_to change(Brand, :count)
      
      expect(response).to have_http_status(:ok)
    end

    it 'handles whitespace in brand name' do
      params = valid_params.deep_dup
      params[:brand][:name] = '  cannondale  '
      
      post :create, params: params
      
      expect(response).to have_http_status(:created)
      created_brand = Brand.last
      expect(created_brand.name).to eq('Cannondale')
    end

    it 'returns JSON:API errors with invalid params' do
      invalid_params = valid_params.deep_dup
      invalid_params[:brand][:name] = ''
      
      post :create, params: invalid_params
      
      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 錯誤格式
      expect(json_response).to have_key('errors')
      expect(json_response['errors']).to be_an(Array)
      expect(json_response['errors'].first).to have_key('status')
      expect(json_response['errors'].first).to have_key('detail')
    end

    it 'requires brand parameters' do
      post :create, params: { other_param: 'Test Brand' }
      
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe 'parameter validation' do
    it 'permits name' do
      params = {
        brand: {
          name: 'Test Brand',
          unauthorized_param: 'should be filtered'
        }
      }
      
      post :create, params: params
      
      expect(response).to have_http_status(:created)
      created_brand = Brand.last
      expect(created_brand.name).to eq('Test Brand')
      # unauthorized_param 應該被過濾掉
    end
  end

  describe 'edge cases' do
    it 'handles very long search queries' do
      long_query = 'a' * 1000
      
      get :index, params: { q: long_query }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data']).to be_an(Array)
    end

    it 'handles special characters in search' do
      create(:brand, name: 'Brand & Co.')
      
      get :index, params: { q: '&' }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data'].length).to eq(1)
    end

    it 'handles unicode characters in brand name' do
      params = {
        brand: {
          name: 'Bränđ Ñamé'
        }
      }
      
      post :create, params: params
      
      expect(response).to have_http_status(:created)
      created_brand = Brand.last
      # titleize 會將每個單詞的首字母大寫，其餘字母小寫
      expect(created_brand.name).to eq('Bränđ ñamé')
    end
  end
end 