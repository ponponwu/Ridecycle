# frozen_string_literal: true

module IntegrationHelpers
  # API 測試輔助方法
  def api_sign_in(user, password = 'password123')
    post '/api/v1/auth/sign_in', params: {
      user: {
        email: user.email,
        password: password
      }
    }
    
    expect(response).to have_http_status(:ok)
    JSON.parse(response.body)['token']
  end

  def auth_headers(token)
    { 
      'Authorization' => "Bearer #{token}",
      'Content-Type' => 'application/json'
    }
  end

  def create_test_bicycle(user, attributes = {})
    brand = Brand.first || create(:brand)
    
    default_attributes = {
      title: '測試腳踏車',
      description: '用於測試的腳踏車',
      price: 15000,
      brand: brand,
      condition: 'good',
      size: 'M',
      user: user
    }
    
    create(:bicycle, default_attributes.merge(attributes))
  end

  def send_test_offer(sender_token, recipient_id, bicycle_id, amount = 12000, message = '我想要這台腳踏車')
    post '/api/v1/messages',
         headers: auth_headers(sender_token),
         params: {
           message: {
             recipient_id: recipient_id,
             bicycle_id: bicycle_id,
             content: message,
             is_offer: true,
             offer_amount: amount
           }
         }
  end

  def accept_offer(offer_id, user_token)
    patch "/api/v1/messages/#{offer_id}/accept_offer",
          headers: auth_headers(user_token)
  end

  def reject_offer(offer_id, user_token)
    patch "/api/v1/messages/#{offer_id}/reject_offer",
          headers: auth_headers(user_token)
  end

  def get_conversations(user_token)
    get '/api/v1/messages/conversations',
        headers: auth_headers(user_token)
  end

  def get_conversation_messages(user_token, other_user_id)
    get "/api/v1/messages/conversations/#{other_user_id}",
        headers: auth_headers(user_token)
  end

  # 創建完整的測試場景
  def setup_seller_buyer_scenario
    seller = create(:user, email: 'seller@test.com', password: 'password123')
    buyer = create(:user, email: 'buyer@test.com', password: 'password123')
    bicycle = create_test_bicycle(seller)
    
    {
      seller: seller,
      buyer: buyer,
      bicycle: bicycle,
      seller_token: api_sign_in(seller),
      buyer_token: api_sign_in(buyer)
    }
  end

  # 創建多買家競爭場景
  def setup_multi_buyer_scenario
    seller = create(:user, email: 'seller@test.com', password: 'password123')
    buyer1 = create(:user, email: 'buyer1@test.com', password: 'password123')
    buyer2 = create(:user, email: 'buyer2@test.com', password: 'password123')
    buyer3 = create(:user, email: 'buyer3@test.com', password: 'password123')
    bicycle = create_test_bicycle(seller, title: '熱門腳踏車', price: 20000)
    
    {
      seller: seller,
      buyers: [buyer1, buyer2, buyer3],
      bicycle: bicycle,
      seller_token: api_sign_in(seller),
      buyer_tokens: [api_sign_in(buyer1), api_sign_in(buyer2), api_sign_in(buyer3)]
    }
  end

  # 驗證 API 回應格式
  def expect_successful_api_response(expected_data_keys = [])
    expect(response).to have_http_status(:ok)
    
    data = JSON.parse(response.body)
    expect(data).to have_key('success')
    expect(data['success']).to be true
    
    if expected_data_keys.any?
      expect(data).to have_key('data')
      expected_data_keys.each do |key|
        expect(data['data']).to have_key(key.to_s)
      end
    end
  end

  def expect_error_api_response(status = :unprocessable_entity, expected_errors = [])
    expect(response).to have_http_status(status)
    
    data = JSON.parse(response.body)
    expect(data).to have_key('success')
    expect(data['success']).to be false
    expect(data).to have_key('errors')
    
    if expected_errors.any?
      expected_errors.each do |error|
        expect(data['errors']).to include(error)
      end
    end
  end

  # 清理測試資料
  def cleanup_test_data
    Message.delete_all
    Bicycle.delete_all
    User.delete_all
    Brand.delete_all
  end
end

# 包含在 RSpec 配置中
RSpec.configure do |config|
  config.include IntegrationHelpers, type: :request
end 