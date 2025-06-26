# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'User Workflow Integration', type: :request do
  let(:user) { create(:user, email: 'buyer@example.com', password: 'password123') }
  let(:seller) { create(:user, email: 'seller@example.com', password: 'password123') }
  let(:brand) { create(:brand, name: 'Giant') }

  # Helper method to sign in via API
  def api_sign_in(user)
    post '/api/v1/auth/sign_in', params: {
      user: {
        email: user.email,
        password: 'password123'
      }
    }
    
    expect(response).to have_http_status(:ok)
    JSON.parse(response.body)['token']
  end

  # Helper method to set auth headers
  def auth_headers(token)
    { 
      'Authorization' => "Bearer #{token}",
      'Content-Type' => 'application/json'
    }
  end

  describe '完整使用者購買流程' do
    it '從註冊到購買的完整流程' do
      # Step 1: 用戶註冊
      post '/api/v1/auth/sign_up', params: {
        user: {
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          password_confirmation: 'password123'
        }
      }
      
      expect(response).to have_http_status(:created)
      new_user_data = JSON.parse(response.body)
      expect(new_user_data['success']).to be true
      
      # Step 2: 用戶登入
      post '/api/v1/auth/sign_in', params: {
        user: {
          email: 'newuser@example.com',
          password: 'password123'
        }
      }
      
      expect(response).to have_http_status(:ok)
      token = JSON.parse(response.body)['token']
      expect(token).to be_present
      
      # Step 3: 瀏覽腳踏車列表
      get '/api/v1/bicycles', headers: auth_headers(token)
      
      expect(response).to have_http_status(:ok)
      bicycles_data = JSON.parse(response.body)
      expect(bicycles_data['data']).to be_an(Array)
      
      # Step 4: 賣家上架商品
      seller_token = api_sign_in(seller)
      
      post '/api/v1/bicycles', 
           headers: auth_headers(seller_token),
           params: {
             bicycle: {
               title: '優質二手腳踏車',
               description: '狀況良好的腳踏車',
               price: 15000,
               brand_id: brand.id,
               condition: 'good',
               size: 'M'
             }
           }
      
      expect(response).to have_http_status(:created)
      bicycle_data = JSON.parse(response.body)
      bicycle_id = bicycle_data['data']['id']
      
      # Step 5: 買家查看商品詳情
      get "/api/v1/bicycles/#{bicycle_id}", headers: auth_headers(token)
      
      expect(response).to have_http_status(:ok)
      bicycle_detail = JSON.parse(response.body)
      expect(bicycle_detail['data']['attributes']['title']).to eq('優質二手腳踏車')
      
      # Step 6: 買家發送一般訊息
      post '/api/v1/messages',
           headers: auth_headers(token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bicycle_id,
               content: '您好，請問這台腳踏車還在嗎？',
               is_offer: false
             }
           }
      
      expect(response).to have_http_status(:created)
      message_data = JSON.parse(response.body)
      expect(message_data['success']).to be true
      
      # Step 7: 買家發送出價訊息
      post '/api/v1/messages',
           headers: auth_headers(token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bicycle_id,
               content: '我想要這台腳踏車',
               is_offer: true,
               offer_amount: 12000
             }
           }
      
      expect(response).to have_http_status(:created)
      offer_data = JSON.parse(response.body)
      expect(offer_data['success']).to be true
      
      offer_message = Message.find(offer_data['data']['id'])
      expect(offer_message.is_offer?).to be true
      expect(offer_message.offer_amount).to eq(12000)
      expect(offer_message.offer_status).to eq('pending')
      
      # Step 8: 賣家查看訊息
      get "/api/v1/messages/conversations/#{user.id}",
          headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      conversation_data = JSON.parse(response.body)
      messages = conversation_data['data']
      expect(messages.length).to eq(2) # 一般訊息 + 出價訊息
      
      # Step 9: 賣家接受出價
      patch "/api/v1/messages/#{offer_message.id}/accept_offer",
            headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      accept_data = JSON.parse(response.body)
      expect(accept_data['success']).to be true
      
      # 驗證出價狀態變更
      offer_message.reload
      expect(offer_message.offer_status).to eq('accepted')
      
      # 驗證腳踏車狀態變更（如果有實現）
      bicycle = Bicycle.find(bicycle_id)
      # expect(bicycle.status).to eq('pending') # 如果有實現狀態變更
      
      # Step 10: 查看對話列表
      get '/api/v1/messages/conversations', headers: auth_headers(token)
      
      expect(response).to have_http_status(:ok)
      conversations_data = JSON.parse(response.body)
      expect(conversations_data['data']).to be_an(Array)
      expect(conversations_data['data'].length).to eq(1)
      
      conversation = conversations_data['data'].first
      expect(conversation['with_user']['id']).to eq(seller.id)
      expect(conversation['bicycle_id']).to eq(bicycle_id)
    end
  end

  describe '防止自己對自己出價的整合測試' do
    it '完整測試自己上架商品後無法對自己出價' do
      # Step 1: 用戶登入
      token = api_sign_in(user)
      
      # Step 2: 用戶上架商品
      post '/api/v1/bicycles',
           headers: auth_headers(token),
           params: {
             bicycle: {
               title: '我的腳踏車',
               description: '我自己的腳踏車',
               price: 10000,
               brand_id: brand.id,
               condition: 'excellent',
               size: 'L'
             }
           }
      
      expect(response).to have_http_status(:created)
      bicycle_data = JSON.parse(response.body)
      own_bicycle_id = bicycle_data['data']['id']
      
      # Step 3: 嘗試對自己的商品出價
      post '/api/v1/messages',
           headers: auth_headers(token),
           params: {
             message: {
               recipient_id: user.id,
               bicycle_id: own_bicycle_id,
               content: '想要出價',
               is_offer: true,
               offer_amount: 8000
             }
           }
      
      expect(response).to have_http_status(:unprocessable_entity)
      error_data = JSON.parse(response.body)
      expect(error_data['success']).to be false
      expect(error_data['errors']).to include('不能對自己發布的腳踏車留言')
      
      # 驗證沒有創建任何訊息
      expect(Message.where(sender: user, bicycle_id: own_bicycle_id)).to be_empty
    end
  end

  describe '多用戶出價競爭測試' do
    let(:user2) { create(:user, email: 'buyer2@example.com', password: 'password123') }
    let(:user3) { create(:user, email: 'buyer3@example.com', password: 'password123') }

    it '測試多個買家對同一商品出價的流程' do
      # 賣家上架商品
      seller_token = api_sign_in(seller)
      
      post '/api/v1/bicycles',
           headers: auth_headers(seller_token),
           params: {
             bicycle: {
               title: '熱門腳踏車',
               description: '非常受歡迎的腳踏車',
               price: 20000,
               brand_id: brand.id,
               condition: 'excellent',
               size: 'M'
             }
           }
      
      bicycle_id = JSON.parse(response.body)['data']['id']
      
      # 多個買家登入
      buyer1_token = api_sign_in(user)
      buyer2_token = api_sign_in(user2)
      buyer3_token = api_sign_in(user3)
      
      # 買家1出價
      post '/api/v1/messages',
           headers: auth_headers(buyer1_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bicycle_id,
               content: '我想要這台',
               is_offer: true,
               offer_amount: 18000
             }
           }
      
      expect(response).to have_http_status(:created)
      offer1_id = JSON.parse(response.body)['data']['id']
      
      # 買家2出價更高
      post '/api/v1/messages',
           headers: auth_headers(buyer2_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bicycle_id,
               content: '我出更高價',
               is_offer: true,
               offer_amount: 19000
             }
           }
      
      expect(response).to have_http_status(:created)
      offer2_id = JSON.parse(response.body)['data']['id']
      
      # 買家3也出價
      post '/api/v1/messages',
           headers: auth_headers(buyer3_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bicycle_id,
               content: '最高價！',
               is_offer: true,
               offer_amount: 21000
             }
           }
      
      expect(response).to have_http_status(:created)
      offer3_id = JSON.parse(response.body)['data']['id']
      
      # 賣家接受買家3的出價
      patch "/api/v1/messages/#{offer3_id}/accept_offer",
            headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      
      # 驗證只有一個出價被接受
      accepted_offers = Message.where(
        bicycle_id: bicycle_id,
        is_offer: true,
        offer_status: 'accepted'
      )
      expect(accepted_offers.count).to eq(1)
      expect(accepted_offers.first.id).to eq(offer3_id.to_i)
      
      # 其他出價仍為 pending
      pending_offers = Message.where(
        bicycle_id: bicycle_id,
        is_offer: true,
        offer_status: 'pending'
      )
      expect(pending_offers.count).to eq(2)
    end
  end

  describe '錯誤處理整合測試' do
    it '測試各種錯誤情境的處理' do
      token = api_sign_in(user)
      
      # 測試對不存在的腳踏車出價
      post '/api/v1/messages',
           headers: auth_headers(token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: 99999,
               content: '想要出價',
               is_offer: true,
               offer_amount: 10000
             }
           }
      
      expect(response).to have_http_status(:not_found)
      error_data = JSON.parse(response.body)
      expect(error_data['errors']).to include('腳踏車不存在')
      
      # 測試未登入的情況
      post '/api/v1/messages',
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: 1,
               content: '想要出價',
               is_offer: true,
               offer_amount: 10000
             }
           }
      
      expect(response).to have_http_status(:unauthorized)
    end
  end
end 