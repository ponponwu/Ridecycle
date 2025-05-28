require 'rails_helper'

RSpec.describe Api::V1::Admin::DashboardController, type: :controller do
  let(:admin_user) { create(:user, admin: true) }
  let(:regular_user) { create(:user, admin: false) }
  let(:brand) { create(:brand) }

  # 創建測試資料
  let!(:pending_bicycles) { create_list(:bicycle, 3, status: :pending, brand: brand) }
  let!(:available_bicycles) { create_list(:bicycle, 5, status: :available, brand: brand) }
  let!(:sold_bicycles) { create_list(:bicycle, 2, status: :sold, brand: brand) }
  let!(:draft_bicycles) { create_list(:bicycle, 1, status: :draft, brand: brand) }
  let!(:admin_users) { create_list(:user, 2, admin: true) }
  let!(:regular_users) { create_list(:user, 8, admin: false) }

  describe 'when user is admin' do
    before do
      allow(controller).to receive(:current_user).and_return(admin_user)
      allow(controller).to receive(:authenticate_user!).and_return(true)
    end

    describe 'GET #stats' do
      it 'returns dashboard statistics in JSON:API format' do
        get :stats
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # 檢查 JSON:API 格式
        expect(json_response).to have_key('data')
        expect(json_response).to have_key('meta')
        expect(json_response['data']).to have_key('type')
        expect(json_response['data']).to have_key('id')
        expect(json_response['data']).to have_key('attributes')
        expect(json_response['data']['type']).to eq('dashboard_stats')
        
        # 檢查統計資料
        stats = json_response['data']['attributes']
        expect(stats['pending_bicycles']).to eq(3)
        expect(stats['available_bicycles']).to eq(5)
        expect(stats['sold_bicycles']).to eq(2)
        expect(stats['draft_bicycles']).to eq(1)
        expect(stats['total_bicycles']).to eq(11)
        expect(stats['total_users']).to eq(11) # 包含 admin_user + admin_users + regular_users
        expect(stats['admin_users']).to eq(3) # admin_user + admin_users
        expect(stats['recent_bicycles']).to eq(11) # 所有自行車都是最近創建的
        expect(stats['recent_users']).to eq(11) # 所有用戶都是最近創建的
      end

      it 'includes timestamp in meta' do
        get :stats
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['meta']).to have_key('timestamp')
        expect(Time.parse(json_response['meta']['timestamp'])).to be_within(1.minute).of(Time.current)
      end
    end

    describe 'GET #recent_activity' do
      it 'returns recent activity in JSON:API format' do
        get :recent_activity
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        # 檢查 JSON:API 格式
        expect(json_response).to have_key('data')
        expect(json_response).to have_key('meta')
        expect(json_response['data']).to have_key('type')
        expect(json_response['data']).to have_key('id')
        expect(json_response['data']).to have_key('attributes')
        expect(json_response['data']['type']).to eq('recent_activity')
        
        # 檢查最近活動資料
        activity = json_response['data']['attributes']
        expect(activity).to have_key('recent_bicycles')
        expect(activity).to have_key('recent_users')
        
        # 檢查最近自行車（預設限制 10 個）
        expect(activity['recent_bicycles']).to be_an(Array)
        expect(activity['recent_bicycles'].length).to eq(10) # 限制為 10 個
        
        # 檢查最近用戶（預設限制 10 個）
        expect(activity['recent_users']).to be_an(Array)
        expect(activity['recent_users'].length).to eq(10) # 限制為 10 個
        
        # 檢查自行車資料結構
        first_bicycle = activity['recent_bicycles'].first
        expect(first_bicycle).to have_key('id')
        expect(first_bicycle).to have_key('title')
        expect(first_bicycle).to have_key('status')
        expect(first_bicycle).to have_key('created_at')
        expect(first_bicycle).to have_key('user')
        expect(first_bicycle['user']).to have_key('name')
        expect(first_bicycle['user']).to have_key('email')
        
        # 檢查用戶資料結構
        first_user = activity['recent_users'].first
        expect(first_user).to have_key('id')
        expect(first_user).to have_key('name')
        expect(first_user).to have_key('email')
        expect(first_user).to have_key('admin')
        expect(first_user).to have_key('created_at')
        expect(first_user).to have_key('bicycles_count')
      end

      it 'orders bicycles by created_at desc' do
        get :recent_activity
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        bicycles = json_response['data']['attributes']['recent_bicycles']
        created_times = bicycles.map { |b| Time.parse(b['created_at']) }
        expect(created_times).to eq(created_times.sort.reverse)
      end

      it 'orders users by created_at desc' do
        get :recent_activity
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        users = json_response['data']['attributes']['recent_users']
        created_times = users.map { |u| Time.parse(u['created_at']) }
        expect(created_times).to eq(created_times.sort.reverse)
      end

      it 'includes bicycles_count for each user' do
        # 為某個用戶創建額外的自行車
        user_with_bikes = regular_users.first
        create_list(:bicycle, 3, user: user_with_bikes, brand: brand)
        
        get :recent_activity
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        users = json_response['data']['attributes']['recent_users']
        user_data = users.find { |u| u['id'] == user_with_bikes.id }
        
        expect(user_data).to be_present
        expect(user_data['bicycles_count']).to eq(3)
      end

      it 'includes timestamp in meta' do
        get :recent_activity
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response['meta']).to have_key('timestamp')
        expect(Time.parse(json_response['meta']['timestamp'])).to be_within(1.minute).of(Time.current)
      end
    end
  end

  describe 'when user is not admin' do
    before do
      allow(controller).to receive(:current_user).and_return(regular_user)
      allow(controller).to receive(:authenticate_user!).and_return(true)
    end

    it 'returns forbidden for stats' do
      get :stats
      
      expect(response).to have_http_status(:forbidden)
      json_response = JSON.parse(response.body)
      
      expect(json_response).to have_key('errors')
      expect(json_response['errors']).to be_an(Array)
      expect(json_response['errors'].first['status']).to eq('403')
      expect(json_response['errors'].first['title']).to eq('Forbidden')
      expect(json_response['errors'].first['detail']).to eq('Access denied. Admin privileges required.')
    end

    it 'returns forbidden for recent_activity' do
      get :recent_activity
      
      expect(response).to have_http_status(:forbidden)
      json_response = JSON.parse(response.body)
      
      expect(json_response).to have_key('errors')
      expect(json_response['errors'].first['status']).to eq('403')
    end
  end

  describe 'when user is not authenticated' do
    before do
      allow(controller).to receive(:current_user).and_return(nil)
      allow(controller).to receive(:authenticate_user!).and_call_original
    end

    it 'returns unauthorized for stats' do
      get :stats
      
      expect(response).to have_http_status(:unauthorized)
      json_response = JSON.parse(response.body)
      
      expect(json_response).to have_key('errors')
      expect(json_response['errors']).to be_an(Array)
      expect(json_response['errors'].first['status']).to eq('401')
      expect(json_response['errors'].first['title']).to eq('Unauthorized')
    end

    it 'returns unauthorized for recent_activity' do
      get :recent_activity
      
      expect(response).to have_http_status(:unauthorized)
      json_response = JSON.parse(response.body)
      
      expect(json_response).to have_key('errors')
      expect(json_response['errors'].first['status']).to eq('401')
    end
  end

  describe 'performance optimization' do
    before do
      allow(controller).to receive(:current_user).and_return(admin_user)
      allow(controller).to receive(:authenticate_user!).and_return(true)
    end

    it 'uses efficient queries for stats' do
      # 監控資料庫查詢數量
      expect {
        get :stats
      }.to make_database_queries(count: 2) # 應該只有 2 個聚合查詢
    end

    it 'uses efficient queries for recent_activity' do
      # 監控資料庫查詢數量，應該避免 N+1 查詢
      expect {
        get :recent_activity
      }.to make_database_queries(count: 2) # 2 個查詢：bicycles 和 users
    end
  end
end 