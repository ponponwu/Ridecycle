require 'rails_helper'

RSpec.describe Api::V1::UsersController, type: :controller do
  let(:user) { create(:user, bank_account_name: 'John Doe', bank_account_number: '123-456-789', bank_code: '123', bank_branch: 'Main Branch') }
  
  before do
    allow(controller).to receive(:authenticate_user!).and_return(true)
    allow(controller).to receive(:current_user).and_return(user)
  end

  describe 'GET #show' do
    it 'returns user profile in JSON:API format' do
      get :show

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      
      # JSON:API 格式檢查
      expect(json).to have_key('data')
      expect(json['data']).to have_key('id')
      expect(json['data']).to have_key('type')
      expect(json['data']).to have_key('attributes')
      
      # 用戶資料檢查
      attributes = json['data']['attributes']
      expect(attributes['id']).to eq(user.id)
      expect(attributes['name']).to eq(user.name)
      expect(attributes['email']).to eq(user.email)
      expect(attributes['bank_account_complete']).to be true
      expect(attributes['bank_account_info']).to be_present
    end
  end

  describe 'PUT #update' do
    let(:valid_params) do
      {
        user: {
          name: 'Updated Name',
          email: 'updated@example.com'
        }
      }
    end

    context 'with valid parameters' do
      it 'updates user successfully in JSON:API format' do
        put :update, params: valid_params

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        
        # JSON:API 格式檢查
        expect(json).to have_key('data')
        expect(json['data']).to have_key('attributes')
        
        # 更新後的資料檢查
        attributes = json['data']['attributes']
        expect(attributes['name']).to eq('Updated Name')
        expect(attributes['email']).to eq('updated@example.com')
        
        # 確認資料庫也被更新
        user.reload
        expect(user.name).to eq('Updated Name')
        expect(user.email).to eq('updated@example.com')
      end
    end

    context 'with invalid parameters' do
      let(:invalid_params) do
        {
          user: {
            name: '',
            email: 'invalid-email'
          }
        }
      end

      it 'returns error in JSON:API format' do
        put :update, params: invalid_params

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        
        # JSON:API 錯誤格式檢查
        expect(json).to have_key('errors')
        expect(json['errors']).to be_an(Array)
        expect(json['errors'].first).to have_key('id')
        expect(json['errors'].first).to have_key('status')
        expect(json['errors'].first).to have_key('title')
        expect(json['errors'].first).to have_key('detail')
      end
    end
  end

  describe 'PUT #update_bank_account' do
    let(:valid_bank_params) do
      {
        bank_account: {
          bank_account_name: 'Jane Doe',
          bank_account_number: '987-654-321',
          bank_code: '456',
          bank_branch: 'Downtown Branch'
        }
      }
    end

    context 'with valid bank account parameters' do
      it 'updates bank account successfully in JSON:API format' do
        put :update_bank_account, params: valid_bank_params

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        
        # JSON:API 自定義響應格式檢查
        expect(json).to have_key('data')
        expect(json['data']).to have_key('type')
        expect(json['data']['type']).to eq('bank_account_update')
        expect(json['data']).to have_key('id')
        expect(json['data']).to have_key('attributes')
        
        # 銀行帳戶資料檢查
        attributes = json['data']['attributes']
        expect(attributes['bank_account']['account_name']).to eq('Jane Doe')
        expect(attributes['bank_account']['account_number']).to eq('987-654-321')
        expect(attributes['bank_account']['bank_code']).to eq('456')
        expect(attributes['bank_account']['bank_branch']).to eq('Downtown Branch')
        expect(attributes['message']).to be_present
        
        # 確認資料庫也被更新
        user.reload
        expect(user.bank_account_name).to eq('Jane Doe')
        expect(user.bank_account_number).to eq('987-654-321')
      end
    end

    context 'with invalid bank account parameters' do
      let(:invalid_bank_params) do
        {
          bank_account: {
            bank_account_name: '',
            bank_account_number: 'invalid',
            bank_code: '12', # 應該是3位數
            bank_branch: ''
          }
        }
      end

      it 'returns error in JSON:API format' do
        put :update_bank_account, params: invalid_bank_params

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        
        # JSON:API 錯誤格式檢查
        expect(json).to have_key('errors')
        expect(json['errors']).to be_an(Array)
        expect(json['errors'].first).to have_key('id')
        expect(json['errors'].first).to have_key('status')
        expect(json['errors'].first).to have_key('title')
        expect(json['errors'].first).to have_key('detail')
      end
    end
  end

  describe 'Authentication' do
    before do
      allow(controller).to receive(:authenticate_user!).and_call_original
      allow(controller).to receive(:current_user).and_return(nil)
    end

    it 'requires authentication for all actions' do
      get :show
      expect(response).to have_http_status(:unauthorized)
      
      put :update, params: { user: { name: 'Test' } }
      expect(response).to have_http_status(:unauthorized)
      
      put :update_bank_account, params: { bank_account: { bank_account_name: 'Test' } }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end 