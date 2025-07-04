require 'rails_helper'

RSpec.describe Api::V1::Admin::UsersController, type: :controller do
  let(:admin_user) { create(:user, admin: true) }
  let(:regular_user) { create(:user, admin: false) }
  let(:suspicious_user) { create(:user, is_suspicious: true) }
  let(:blacklisted_user) { create(:user, is_blacklisted: true) }

  before do
    sign_in admin_user
  end

  describe 'GET #index' do
    context 'when user is admin' do
      before do
        regular_user
        suspicious_user
        blacklisted_user
      end

      it 'returns all users' do
        get :index
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['data']).to be_an(Array)
        expect(json_response['data'].length).to eq(4) # admin + 3 users
      end

      it 'includes user statistics in meta' do
        get :index
        json_response = JSON.parse(response.body)
        expect(json_response['meta']).to include('total_count', 'admin_count', 'blacklisted_count')
      end
    end

    context 'when user is not admin' do
      before do
        sign_in regular_user
      end

      it 'returns forbidden' do
        get :index
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'GET #show' do
    context 'when user is admin' do
      it 'returns specific user details' do
        get :show, params: { id: regular_user.id }
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['data']['id']).to eq(regular_user.id)
        expect(json_response['data']['email']).to eq(regular_user.email)
      end

      it 'includes user statistics' do
        get :show, params: { id: regular_user.id }
        json_response = JSON.parse(response.body)
        expect(json_response['data']).to include('bicycles_count', 'messages_count')
      end
    end

    context 'when user not found' do
      it 'returns not found' do
        get :show, params: { id: 999999 }
        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'PATCH #blacklist' do
    context 'when user is admin' do
      it 'toggles blacklist status' do
        expect(regular_user.is_blacklisted).to be false
        
        patch :blacklist, params: { id: regular_user.id }
        expect(response).to have_http_status(:ok)
        
        regular_user.reload
        expect(regular_user.is_blacklisted).to be true
      end

      it 'can unblacklist a blacklisted user' do
        expect(blacklisted_user.is_blacklisted).to be true
        
        patch :blacklist, params: { id: blacklisted_user.id }
        expect(response).to have_http_status(:ok)
        
        blacklisted_user.reload
        expect(blacklisted_user.is_blacklisted).to be false
      end

      it 'returns updated status in response' do
        patch :blacklist, params: { id: regular_user.id }
        json_response = JSON.parse(response.body)
        expect(json_response['data']['is_blacklisted']).to be true
        expect(json_response['data']['message']).to include('blacklisted')
      end
    end

    context 'when user is not admin' do
      before do
        sign_in regular_user
      end

      it 'returns forbidden' do
        patch :blacklist, params: { id: regular_user.id }
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'PATCH #suspicious' do
    context 'when user is admin' do
      it 'toggles suspicious status' do
        expect(regular_user.is_suspicious).to be false
        
        patch :suspicious, params: { id: regular_user.id }
        expect(response).to have_http_status(:ok)
        
        regular_user.reload
        expect(regular_user.is_suspicious).to be true
      end

      it 'can remove suspicious mark' do
        expect(suspicious_user.is_suspicious).to be true
        
        patch :suspicious, params: { id: suspicious_user.id }
        expect(response).to have_http_status(:ok)
        
        suspicious_user.reload
        expect(suspicious_user.is_suspicious).to be false
      end

      it 'returns updated status in response' do
        patch :suspicious, params: { id: regular_user.id }
        json_response = JSON.parse(response.body)
        expect(json_response['data']['is_suspicious']).to be true
        expect(json_response['data']['message']).to include('suspicious')
      end
    end
  end

  describe 'PATCH #make_admin' do
    context 'when user is admin' do
      it 'makes user an admin' do
        expect(regular_user.admin).to be false
        
        patch :make_admin, params: { id: regular_user.id }
        expect(response).to have_http_status(:ok)
        
        regular_user.reload
        expect(regular_user.admin).to be true
      end

      it 'returns updated status in response' do
        patch :make_admin, params: { id: regular_user.id }
        json_response = JSON.parse(response.body)
        expect(json_response['data']['admin']).to be true
        expect(json_response['data']['message']).to include('made admin')
      end
    end
  end

  describe 'PATCH #remove_admin' do
    let(:another_admin) { create(:user, admin: true) }

    context 'when user is admin' do
      it 'removes admin privileges' do
        expect(another_admin.admin).to be true
        
        patch :remove_admin, params: { id: another_admin.id }
        expect(response).to have_http_status(:ok)
        
        another_admin.reload
        expect(another_admin.admin).to be false
      end

      it 'returns updated status in response' do
        patch :remove_admin, params: { id: another_admin.id }
        json_response = JSON.parse(response.body)
        expect(json_response['data']['admin']).to be false
        expect(json_response['data']['message']).to include('removed')
      end
    end
  end

  private

  def sign_in(user)
    request.headers['Authorization'] = "Bearer #{generate_test_token(user)}"
  end

  def generate_test_token(user)
    JWT.encode({ user_id: user.id }, Rails.application.credentials.jwt_secret)
  end
end