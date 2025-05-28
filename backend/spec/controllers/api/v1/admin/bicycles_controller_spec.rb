require 'rails_helper'

RSpec.describe Api::V1::Admin::BicyclesController, type: :controller do
  let(:admin_user) { create(:user, admin: true) }
  let(:regular_user) { create(:user, admin: false) }
  let(:brand) { create(:brand) }
  let!(:pending_bicycle) { create(:bicycle, user: regular_user, brand: brand, status: :pending) }
  let!(:available_bicycle) { create(:bicycle, user: regular_user, brand: brand, status: :available) }
  let!(:sold_bicycle) { create(:bicycle, user: regular_user, brand: brand, status: :sold) }

  describe 'when user is admin' do
    before do
      allow(controller).to receive(:current_user).and_return(admin_user)
      allow(controller).to receive(:authenticate_user!).and_return(true)
    end

    describe 'GET #index' do
      it 'returns all bicycles in JSON:API format' do
        get :index
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # 檢查 JSON:API 格式
        expect(json_response).to have_key('data')
        expect(json_response).to have_key('meta')
        expect(json_response['data']).to be_an(Array)
        expect(json_response['data'].length).to eq(3)
        
        # 檢查第一個項目的結構
        first_item = json_response['data'].first
        expect(first_item).to have_key('id')
        expect(first_item).to have_key('type')
        expect(first_item).to have_key('attributes')
        expect(first_item['type']).to eq('bicycle')
      end

      it 'filters bicycles by status' do
        get :index, params: { status: 'pending' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['data'].length).to eq(1)
        expect(json_response['data'][0]['attributes']['status']).to eq('pending')
      end

      it 'filters bicycles by search term' do
        pending_bicycle.update(title: 'Trek Mountain Bike')
        available_bicycle.update(title: 'Specialized Road Bike')
        
        get :index, params: { search: 'Trek' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['data'].length).to eq(1)
        expect(json_response['data'][0]['attributes']['title']).to include('Trek')
      end

      it 'includes pagination metadata' do
        get :index, params: { page: 1, limit: 2 }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['meta']).to include(
          'total_count', 'current_page', 'per_page', 'total_pages', 'status_counts'
        )
        expect(json_response['meta']['current_page']).to eq(1)
        expect(json_response['meta']['per_page']).to eq(2)
        expect(json_response['meta']['status_counts']).to be_a(Hash)
      end

      it 'orders bicycles by created_at desc' do
        get :index
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        created_times = json_response['data'].map { |b| Time.parse(b['attributes']['created_at']) }
        expect(created_times).to eq(created_times.sort.reverse)
      end
    end

    describe 'GET #show' do
      it 'returns the bicycle details in JSON:API format' do
        get :show, params: { id: pending_bicycle.id }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # 檢查 JSON:API 格式
        expect(json_response).to have_key('data')
        expect(json_response['data']).to have_key('id')
        expect(json_response['data']).to have_key('type')
        expect(json_response['data']).to have_key('attributes')
        expect(json_response['data']['id']).to eq(pending_bicycle.id.to_s)
        expect(json_response['data']['type']).to eq('bicycle')
        expect(json_response['data']['attributes']['title']).to eq(pending_bicycle.title)
      end

      it 'returns JSON:API error for non-existent bicycle' do
        get :show, params: { id: 99999 }
        
        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        
        expect(json_response).to have_key('errors')
        expect(json_response['errors']).to be_an(Array)
        expect(json_response['errors'].first['status']).to eq('404')
        expect(json_response['errors'].first['title']).to eq('Not Found')
      end
    end

    describe 'PATCH #approve' do
      it 'approves a pending bicycle and returns custom JSON:API response' do
        expect(pending_bicycle.status).to eq('pending')
        
        patch :approve, params: { id: pending_bicycle.id }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # 檢查自定義 JSON:API 格式
        expect(json_response).to have_key('data')
        expect(json_response).to have_key('meta')
        expect(json_response['data']['type']).to eq('bicycle_approval')
        expect(json_response['data']['id']).to eq(pending_bicycle.id.to_s)
        expect(json_response['data']['attributes']['status']).to eq('available')
        expect(json_response['data']['attributes']).to have_key('approved_at')
        expect(json_response['data']['attributes']['approved_by']).to eq(admin_user.id)
        expect(json_response['meta']['message']).to eq('Bicycle approved successfully')
        
        # 檢查資料庫更新
        pending_bicycle.reload
        expect(pending_bicycle.status).to eq('available')
      end

      it 'returns JSON:API error for non-existent bicycle' do
        patch :approve, params: { id: 99999 }
        
        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('errors')
      end

      it 'returns JSON:API error if update fails' do
        # Mock update failure
        allow_any_instance_of(Bicycle).to receive(:update).and_return(false)
        allow_any_instance_of(Bicycle).to receive(:errors).and_return(
          double(full_messages: ['Status transition not allowed'])
        )
        
        patch :approve, params: { id: pending_bicycle.id }
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('errors')
        expect(json_response['errors'].first['detail']).to eq('Status transition not allowed')
      end
    end

    describe 'PATCH #reject' do
      it 'rejects a pending bicycle and returns custom JSON:API response' do
        expect(pending_bicycle.status).to eq('pending')
        
        patch :reject, params: { id: pending_bicycle.id, reason: 'Incomplete information' }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # 檢查自定義 JSON:API 格式
        expect(json_response).to have_key('data')
        expect(json_response).to have_key('meta')
        expect(json_response['data']['type']).to eq('bicycle_rejection')
        expect(json_response['data']['id']).to eq(pending_bicycle.id.to_s)
        expect(json_response['data']['attributes']['status']).to eq('draft')
        expect(json_response['data']['attributes']).to have_key('rejected_at')
        expect(json_response['data']['attributes']['rejected_by']).to eq(admin_user.id)
        expect(json_response['data']['attributes']['rejection_reason']).to eq('Incomplete information')
        expect(json_response['meta']['message']).to eq('Bicycle rejected successfully')
        
        # 檢查資料庫更新
        pending_bicycle.reload
        expect(pending_bicycle.status).to eq('draft')
      end

      it 'rejects without reason' do
        patch :reject, params: { id: pending_bicycle.id }
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['data']['attributes']['rejection_reason']).to be_nil
      end

      it 'returns JSON:API error for non-existent bicycle' do
        patch :reject, params: { id: 99999 }
        
        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('errors')
      end
    end

    describe 'PATCH #update' do
      let(:update_params) do
        {
          id: pending_bicycle.id,
          bicycle: {
            title: 'Updated Admin Title',
            price: 2500.00,
            status: 'available'
          }
        }
      end

      it 'updates the bicycle and returns JSON:API format' do
        patch :update, params: update_params
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # 檢查 JSON:API 格式
        expect(json_response).to have_key('data')
        expect(json_response['data']['attributes']['title']).to eq('Updated Admin Title')
        expect(json_response['data']['attributes']['price']).to eq(2500.0)
        expect(json_response['data']['attributes']['status']).to eq('available')
        
        # 檢查資料庫更新
        pending_bicycle.reload
        expect(pending_bicycle.title).to eq('Updated Admin Title')
        expect(pending_bicycle.price).to eq(2500.00)
        expect(pending_bicycle.status).to eq('available')
      end

      it 'returns JSON:API errors with invalid params' do
        invalid_params = update_params.deep_dup
        invalid_params[:bicycle][:price] = -100
        
        patch :update, params: invalid_params
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('errors')
      end

      it 'returns JSON:API error for non-existent bicycle' do
        patch :update, params: { id: 99999, bicycle: { title: 'Test' } }
        
        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('errors')
      end
    end

    describe 'DELETE #destroy' do
      it 'deletes the bicycle and returns 204' do
        expect {
          delete :destroy, params: { id: pending_bicycle.id }
        }.to change(Bicycle, :count).by(-1)
        
        expect(response).to have_http_status(:no_content)
        expect(response.body).to be_empty
      end

      it 'returns JSON:API error for non-existent bicycle' do
        delete :destroy, params: { id: 99999 }
        
        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('errors')
      end

      it 'returns JSON:API error if deletion fails' do
        # Mock deletion failure
        allow_any_instance_of(Bicycle).to receive(:destroy).and_return(false)
        allow_any_instance_of(Bicycle).to receive(:errors).and_return(
          double(full_messages: ['Cannot delete bicycle with active orders'])
        )
        
        delete :destroy, params: { id: pending_bicycle.id }
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('errors')
      end
    end
  end

  describe 'when user is not admin' do
    before do
      allow(controller).to receive(:current_user).and_return(regular_user)
      allow(controller).to receive(:authenticate_user!).and_return(true)
    end

    it 'returns forbidden for index' do
      get :index
      
      expect(response).to have_http_status(:forbidden)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
      expect(json_response['errors'].first['status']).to eq('403')
      expect(json_response['errors'].first['title']).to eq('Forbidden')
    end

    it 'returns forbidden for show' do
      get :show, params: { id: pending_bicycle.id }
      
      expect(response).to have_http_status(:forbidden)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
    end

    it 'returns forbidden for approve' do
      patch :approve, params: { id: pending_bicycle.id }
      
      expect(response).to have_http_status(:forbidden)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
    end

    it 'returns forbidden for reject' do
      patch :reject, params: { id: pending_bicycle.id }
      
      expect(response).to have_http_status(:forbidden)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
    end

    it 'returns forbidden for update' do
      patch :update, params: { id: pending_bicycle.id, bicycle: { title: 'Test' } }
      
      expect(response).to have_http_status(:forbidden)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
    end

    it 'returns forbidden for destroy' do
      delete :destroy, params: { id: pending_bicycle.id }
      
      expect(response).to have_http_status(:forbidden)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
    end
  end

  describe 'when user is not authenticated' do
    before do
      allow(controller).to receive(:current_user).and_return(nil)
      allow(controller).to receive(:authenticate_user!).and_call_original
    end

    it 'returns unauthorized for index' do
      get :index
      
      expect(response).to have_http_status(:unauthorized)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
      expect(json_response['errors'].first['status']).to eq('401')
    end

    it 'returns unauthorized for other actions' do
      actions = [
        [:show, { id: pending_bicycle.id }],
        [:approve, { id: pending_bicycle.id }],
        [:reject, { id: pending_bicycle.id }],
        [:update, { id: pending_bicycle.id, bicycle: { title: 'Test' } }],
        [:destroy, { id: pending_bicycle.id }]
      ]

      actions.each do |action, params|
        case action
        when :show
          get action, params: params
        when :approve, :reject, :update
          patch action, params: params
        when :destroy
          delete action, params: params
        end

        expect(response).to have_http_status(:unauthorized)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('errors')
      end
    end
  end
end 