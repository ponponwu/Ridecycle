require 'rails_helper'

RSpec.describe Api::V1::AuthController, type: :controller do
  let(:user) { create(:user, email: 'test@example.com', password: 'password123') }
  
  describe 'POST #register' do
    let(:valid_params) do
      {
        auth: {
          email: 'newuser@example.com',
          password: 'password123',
          password_confirmation: 'password123',
          full_name: 'New User',
          agreement: true
        }
      }
    end

    it 'creates a new user and returns JSON:API format' do
      expect {
        post :register, params: valid_params
      }.to change(User, :count).by(1)
      
      expect(response).to have_http_status(:created)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response['data']).to have_key('id')
      expect(json_response['data']).to have_key('type')
      expect(json_response['data']).to have_key('attributes')
      expect(json_response['data']['type']).to eq('user')
      expect(json_response['data']['attributes']['email']).to eq('newuser@example.com')
      expect(json_response['data']['attributes']['name']).to eq('New User')
      
      # 檢查密碼不會被回傳
      expect(json_response['data']['attributes']).not_to have_key('password')
      expect(json_response['data']['attributes']).not_to have_key('password_digest')
    end

    it 'sets authentication cookies' do
      post :register, params: valid_params
      
      expect(response.cookies['access_token_cookie']).to be_present
      expect(response.cookies['refresh_token_cookie']).to be_present
    end

    it 'returns JSON:API errors with invalid params' do
      invalid_params = valid_params.deep_dup
      invalid_params[:auth][:email] = '' # 空字串會觸發 presence 驗證
      
      post :register, params: invalid_params
      
      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 錯誤格式
      expect(json_response).to have_key('errors')
      expect(json_response['errors']).to be_an(Array)
      expect(json_response['errors'].first).to have_key('status')
      expect(json_response['errors'].first).to have_key('detail')
    end

    it 'returns JSON:API errors when email already exists' do
      create(:user, email: 'newuser@example.com')
      
      post :register, params: valid_params
      
      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
      expect(json_response['errors'].first['detail']).to include('Email')
    end

    it 'returns JSON:API errors when passwords do not match' do
      invalid_params = valid_params.deep_dup
      invalid_params[:auth][:password_confirmation] = 'different_password'
      
      post :register, params: invalid_params
      
      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
    end

    it 'maps full_name to name attribute' do
      post :register, params: valid_params
      
      expect(response).to have_http_status(:created)
      created_user = User.last
      expect(created_user.name).to eq('New User')
    end
  end

  describe 'POST #login' do
    let(:login_params) do
      {
        email: user.email,
        password: 'password123'
      }
    end

    it 'authenticates user and returns JSON:API format' do
      post :login, params: login_params
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 格式
      expect(json_response).to have_key('data')
      expect(json_response['data']).to have_key('id')
      expect(json_response['data']).to have_key('type')
      expect(json_response['data']).to have_key('attributes')
      expect(json_response['data']['type']).to eq('user')
      expect(json_response['data']['attributes']['email']).to eq(user.email)
      expect(json_response['data']['attributes']['name']).to eq(user.name)
      
      # 檢查密碼不會被回傳
      expect(json_response['data']['attributes']).not_to have_key('password')
      expect(json_response['data']['attributes']).not_to have_key('password_digest')
    end

    it 'sets authentication cookies' do
      post :login, params: login_params
      
      expect(response.cookies['access_token_cookie']).to be_present
      expect(response.cookies['refresh_token_cookie']).to be_present
    end

    it 'returns JSON:API error with invalid credentials' do
      invalid_params = login_params.merge(password: 'wrong_password')
      
      post :login, params: invalid_params
      
      expect(response).to have_http_status(:unauthorized)
      json_response = JSON.parse(response.body)
      
      # 檢查 JSON:API 錯誤格式
      expect(json_response).to have_key('errors')
      expect(json_response['errors']).to be_an(Array)
      expect(json_response['errors'].first['status']).to eq('401')
      expect(json_response['errors'].first['title']).to eq('Unauthorized')
      expect(json_response['errors'].first['detail']).to eq('Invalid email or password')
    end

    it 'returns JSON:API error with non-existent email' do
      invalid_params = login_params.merge(email: 'nonexistent@example.com')
      
      post :login, params: invalid_params
      
      expect(response).to have_http_status(:unauthorized)
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('errors')
      expect(json_response['errors'].first['detail']).to eq('Invalid email or password')
    end

    it 'creates refresh token in database' do
      expect {
        post :login, params: login_params
      }.to change(RefreshToken, :count).by(1)
      
      refresh_token = RefreshToken.last
      expect(refresh_token.user).to eq(user)
      expect(refresh_token.active?).to be true
    end
  end

  describe 'GET #me' do
    context 'when user is authenticated' do
      before do
        allow(controller).to receive(:current_user).and_return(user)
        allow(controller).to receive(:authenticate_user!).and_return(true)
      end

      it 'returns current user in JSON:API format' do
        get :me
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # 檢查 JSON:API 格式
        expect(json_response).to have_key('data')
        expect(json_response['data']).to have_key('id')
        expect(json_response['data']).to have_key('type')
        expect(json_response['data']).to have_key('attributes')
        expect(json_response['data']['type']).to eq('user')
        expect(json_response['data']['attributes']['email']).to eq(user.email)
        expect(json_response['data']['attributes']['name']).to eq(user.name)
        
        # 檢查密碼不會被回傳
        expect(json_response['data']['attributes']).not_to have_key('password')
        expect(json_response['data']['attributes']).not_to have_key('password_digest')
      end
    end

    context 'when user is not authenticated' do
      before do
        allow(controller).to receive(:current_user).and_return(nil)
        allow(controller).to receive(:authenticate_user!).and_call_original
      end

      it 'returns JSON:API error' do
        get :me
        
        expect(response).to have_http_status(:unauthorized)
        json_response = JSON.parse(response.body)
        
        expect(json_response).to have_key('errors')
        expect(json_response['errors']).to be_an(Array)
        expect(json_response['errors'].first['status']).to eq('401')
        expect(json_response['errors'].first['title']).to eq('Unauthorized')
      end
    end
  end

  describe 'DELETE #logout' do
    before do
      allow(controller).to receive(:current_user).and_return(user)
      allow(controller).to receive(:authenticate_user!).and_return(true)
    end

    it 'logs out user and returns 204' do
      # 創建一些 refresh tokens
      tokens = create_list(:refresh_token, 2, user: user)
      
      delete :logout
      
      expect(response).to have_http_status(:no_content)
      expect(response.body).to be_empty
      
      # 檢查 refresh tokens 被撤銷
      tokens.each do |token|
        token.reload
        expect(token.active?).to be false
      end
    end

    it 'deletes authentication cookies' do
      delete :logout
      
      expect(response.cookies['access_token_cookie']).to be_nil
      expect(response.cookies['refresh_token_cookie']).to be_nil
    end
  end

  describe 'GET #csrf_token' do
    it 'returns CSRF token information' do
      get :csrf_token
      
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      
      expect(json_response['status']).to eq('ok')
      expect(json_response['token']).to be_present
    end

    it 'sets CSRF token in cookies' do
      get :csrf_token
      
      expect(response.cookies['X-CSRF-Token']).to be_present
      
      # 也檢查 JSON 回應中是否包含 token
      json_response = JSON.parse(response.body)
      expect(json_response['status']).to eq('ok')
      expect(json_response['token']).to be_present
    end

    it 'sets CSRF token in response headers' do
      get :csrf_token
      
      expect(response.headers['X-CSRF-Token']).to be_present
    end

    it 'does not require authentication' do
      # 確保沒有設置 current_user
      allow(controller).to receive(:current_user).and_return(nil)
      
      get :csrf_token
      
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'CSRF protection' do
    it 'skips CSRF verification for login' do
      # 模擬沒有 CSRF token 的請求
      allow(controller).to receive(:verified_request?).and_return(false)
      
      post :login, params: { email: user.email, password: 'password123' }
      
      # 應該成功，因為 login 跳過 CSRF 驗證
      expect(response).to have_http_status(:ok)
    end

    it 'skips CSRF verification for register' do
      allow(controller).to receive(:verified_request?).and_return(false)
      
      post :register, params: {
        auth: {
          email: 'test@example.com',
          password: 'password123',
          password_confirmation: 'password123',
          full_name: 'Test User'
        }
      }
      
      expect(response).to have_http_status(:created)
    end

    it 'skips CSRF verification for logout' do
      allow(controller).to receive(:current_user).and_return(user)
      allow(controller).to receive(:verified_request?).and_return(false)
      
      delete :logout
      
      expect(response).to have_http_status(:no_content)
    end
  end

  describe 'parameter handling' do
    it 'handles nested auth parameters correctly' do
      params = {
        auth: {
          email: 'test@example.com',
          password: 'password123',
          password_confirmation: 'password123',
          full_name: 'Test User'
        }
      }
      
      post :register, params: params
      
      expect(response).to have_http_status(:created)
      created_user = User.last
      expect(created_user.email).to eq('test@example.com')
      expect(created_user.name).to eq('Test User')
    end

    it 'requires auth parameters for register' do
      post :register, params: {
        email: 'test@example.com',
        password: 'password123'
      }
      
      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end 