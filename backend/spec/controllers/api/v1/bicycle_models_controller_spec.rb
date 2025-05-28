require 'rails_helper'

RSpec.describe Api::V1::BicycleModelsController, type: :controller do
  let!(:brand1) { create(:brand, name: 'Trek') }
  let!(:brand2) { create(:brand, name: 'Specialized') }
  let!(:model1) { create(:bicycle_model, name: 'Domane', brand: brand1, year: 2023) }
  let!(:model2) { create(:bicycle_model, name: 'Madone', brand: brand1, year: 2023) }
  let!(:model3) { create(:bicycle_model, name: 'Tarmac', brand: brand2, year: 2023) }

  describe 'GET #index' do
    it 'returns all bicycle models in JSON:API format' do
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
      expect(first_item['type']).to eq('bicycle_model')
    end

    it 'orders models by name' do
      get :index
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      model_names = json_response['data'].map { |m| m['attributes']['name'] }
      expect(model_names).to eq(['Domane', 'Madone', 'Tarmac'])
    end

    it 'filters models by brand_id' do
      get :index, params: { brand_id: brand1.id }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      expect(json_response['data'].length).to eq(2)
      model_names = json_response['data'].map { |m| m['attributes']['name'] }
      expect(model_names).to contain_exactly('Domane', 'Madone')
    end

    it 'filters models by search query' do
      get :index, params: { q: 'dom' }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      expect(json_response['data'].length).to eq(1)
      expect(json_response['data'][0]['attributes']['name']).to eq('Domane')
    end

    it 'combines brand_id and search filters' do
      get :index, params: { brand_id: brand1.id, q: 'mad' }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      expect(json_response['data'].length).to eq(1)
      expect(json_response['data'][0]['attributes']['name']).to eq('Madone')
    end

    it 'performs case-insensitive search' do
      get :index, params: { q: 'DOMANE' }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      expect(json_response['data'].length).to eq(1)
      expect(json_response['data'][0]['attributes']['name']).to eq('Domane')
    end

    it 'returns empty array when no models match filters' do
      get :index, params: { brand_id: brand1.id, q: 'nonexistent' }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(0)
    end

    it 'handles non-existent brand_id' do
      get :index, params: { brand_id: 99999 }
      
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
    it 'returns the bicycle model details in JSON:API format' do
      get :show, params: { id: model1.id }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response['data']).to have_key('id')
      expect(json_response['data']).to have_key('type')
      expect(json_response['data']).to have_key('attributes')
      expect(json_response['data']['type']).to eq('bicycle_model')
      expect(json_response['data']['id']).to eq(model1.id.to_s)
      expect(json_response['data']['attributes']['name']).to eq('Domane')
      expect(json_response['data']['attributes']['year']).to eq(2023)
    end

    it 'returns JSON:API error for non-existent model' do
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
        bicycle_model: {
          name: 'Emonda',
          description: 'Lightweight road bike',
          year: 2024,
          brand_id: brand1.id,
          frame_material: :carbon
        }
      }
    end

    it 'creates a new bicycle model and returns JSON:API format' do
      expect {
        post :create, params: valid_params
      }.to change(BicycleModel, :count).by(1)
      
      expect(response).to have_http_status(:created)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response['data']).to have_key('id')
      expect(json_response['data']).to have_key('type')
      expect(json_response['data']).to have_key('attributes')
      expect(json_response['data']['type']).to eq('bicycle_model')
      expect(json_response['data']['attributes']['name']).to eq('Emonda')
      expect(json_response['data']['attributes']['description']).to eq('Lightweight road bike')
      expect(json_response['data']['attributes']['year']).to eq(2024)
      expect(json_response['data']['attributes']['frame_material']).to eq('carbon')
    end

    it 'normalizes model name to titleize' do
      params = valid_params.deep_dup
      params[:bicycle_model][:name] = 'emonda'
      
      post :create, params: params
      
      expect(response).to have_http_status(:created)
      created_model = BicycleModel.last
      expect(created_model.name).to eq('Emonda')
    end

    it 'returns existing model if brand and name combination already exists' do
      existing_model = create(:bicycle_model, name: 'Emonda', brand: brand1)
      
      expect {
        post :create, params: valid_params
      }.not_to change(BicycleModel, :count)
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      expect(json_response['data']['id']).to eq(existing_model.id.to_s)
      expect(json_response['data']['attributes']['name']).to eq('Emonda')
    end

    it 'allows same model name for different brands' do
      create(:bicycle_model, name: 'Emonda', brand: brand2)
      
      expect {
        post :create, params: valid_params
      }.to change(BicycleModel, :count).by(1)
      
      expect(response).to have_http_status(:created)
    end

    it 'handles whitespace in model name' do
      params = valid_params.deep_dup
      params[:bicycle_model][:name] = '  emonda  '
      
      post :create, params: params
      
      expect(response).to have_http_status(:created)
      created_model = BicycleModel.last
      expect(created_model.name).to eq('Emonda')
    end

    it 'stores frame_material as enum' do
      post :create, params: valid_params
      
      expect(response).to have_http_status(:created)
      created_model = BicycleModel.last
      expect(created_model.frame_material).to eq('carbon')
    end

    it 'returns JSON:API errors with invalid params' do
      invalid_params = valid_params.deep_dup
      invalid_params[:bicycle_model][:name] = ''
      
      post :create, params: invalid_params
      
      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 錯誤格式
      expect(json_response).to have_key('errors')
      expect(json_response['errors']).to be_an(Array)
      expect(json_response['errors'].first).to have_key('status')
      expect(json_response['errors'].first).to have_key('detail')
    end

    it 'returns JSON:API errors with invalid brand_id' do
      invalid_params = valid_params.deep_dup
      invalid_params[:bicycle_model][:brand_id] = 99999
      
      post :create, params: invalid_params
      
      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
    end

    it 'requires bicycle_model parameters' do
      post :create, params: { name: 'Test Model' }
      
      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe 'parameter validation' do
    it 'permits name, description, year, brand_id, and frame_material' do
      params = {
        bicycle_model: {
          name: 'Test Model',
          description: 'Test Description',
          year: 2024,
          brand_id: brand1.id,
          frame_material: :aluminum,
          unauthorized_param: 'should be filtered'
        }
      }
      
      post :create, params: params
      
      expect(response).to have_http_status(:created)
      created_model = BicycleModel.last
      expect(created_model.name).to eq('Test Model')
      expect(created_model.description).to eq('Test Description')
      expect(created_model.year).to eq(2024)
      expect(created_model.brand_id).to eq(brand1.id)
      expect(created_model.frame_material).to eq('aluminum')
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
      create(:bicycle_model, name: 'Model & Co.', brand: brand1)
      
      get :index, params: { q: '&' }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response['data'].length).to eq(1)
    end

    it 'handles unicode characters in model name' do
      params = {
        bicycle_model: {
          name: 'Mödél Ñamé',
          brand_id: brand1.id,
          description: 'Unicode test'
        }
      }
      
      post :create, params: params
      
      expect(response).to have_http_status(:created)
      created_model = BicycleModel.last
      # titleize 會將每個單詞的首字母大寫，其餘字母小寫
      expect(created_model.name).to eq('Mödél ñamé')
    end

    it 'handles different frame materials' do
      params = {
        bicycle_model: {
          name: 'Steel Model',
          brand_id: brand1.id,
          description: 'Steel frame bike',
          year: 2024,
          frame_material: :steel
        }
      }
      
      post :create, params: params
      
      expect(response).to have_http_status(:created)
      created_model = BicycleModel.last
      expect(created_model.frame_material).to eq('steel')
    end
  end

  describe 'brand association' do
    it 'includes brand information in response' do
      get :show, params: { id: model1.id }
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      # 檢查是否包含品牌資訊（如果序列化器有設定的話）
      expect(json_response['data']['attributes']).to have_key('brand_id')
      expect(json_response['data']['attributes']['brand_id']).to eq(brand1.id)
    end
  end
end 