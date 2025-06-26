# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Real World Scenarios Integration', type: :request do
  describe '真實購買情境測試' do
    it '週末高峰期多用戶同時購買情境' do
      # 建立多個用戶和商品
      seller1 = create(:user, name: '小明', email: 'seller1@test.com')
      seller2 = create(:user, name: '小華', email: 'seller2@test.com')
      
      buyer1 = create(:user, name: '買家A', email: 'buyer1@test.com')
      buyer2 = create(:user, name: '買家B', email: 'buyer2@test.com')
      buyer3 = create(:user, name: '買家C', email: 'buyer3@test.com')
      
      # 建立熱門商品
      hot_bike = create_test_bicycle(seller1, {
        title: '幾乎全新 Giant TCR',
        price: 25000,
        condition: 'excellent'
      })
      
      regular_bike = create_test_bicycle(seller2, {
        title: '通勤代步車',
        price: 8000,
        condition: 'fair'
      })
      
      # 取得認證 token
      seller1_token = api_sign_in(seller1)
      buyer1_token = api_sign_in(buyer1)
      buyer2_token = api_sign_in(buyer2)
      buyer3_token = api_sign_in(buyer3)
      
      # 情境：多人同時對熱門商品出價
      offers = []
      
      # 買家A率先出價，但價格保守
      post '/api/v1/messages',
           headers: auth_headers(buyer1_token),
           params: {
             message: {
               recipient_id: seller1.id,
               bicycle_id: hot_bike.id,
               content: '車況看起來不錯，可以便宜一點嗎？',
               is_offer: true,
               offer_amount: 20000
             }
           }
      
      expect(response).to have_http_status(:created)
      offers << JSON.parse(response.body)['data']['id']
      
      # 買家B出更高價
      post '/api/v1/messages',
           headers: auth_headers(buyer2_token),
           params: {
             message: {
               recipient_id: seller1.id,
               bicycle_id: hot_bike.id,
               content: '我很需要這台車，願意出高價',
               is_offer: true,
               offer_amount: 24000
             }
           }
      
      expect(response).to have_http_status(:created)
      offers << JSON.parse(response.body)['data']['id']
      
      # 買家C決定出原價
      post '/api/v1/messages',
           headers: auth_headers(buyer3_token),
           params: {
             message: {
               recipient_id: seller1.id,
               bicycle_id: hot_bike.id,
               content: '不囉嗦，原價收購',
               is_offer: true,
               offer_amount: 25000
             }
           }
      
      expect(response).to have_http_status(:created)
      offers << JSON.parse(response.body)['data']['id']
      
      # 賣家查看所有出價
      get '/api/v1/messages/conversations',
          headers: auth_headers(seller1_token)
      
      expect(response).to have_http_status(:ok)
      conversations = JSON.parse(response.body)['data']
      expect(conversations.length).to eq(3)
      
      # 賣家接受最高價（買家C）
      patch "/api/v1/messages/#{offers.last}/accept_offer",
            headers: auth_headers(seller1_token)
      
      expect(response).to have_http_status(:ok)
      
      # 驗證其他出價者仍可以查看自己的出價狀態
      get "/api/v1/messages/conversations/#{seller1.id}",
          headers: auth_headers(buyer1_token)
      
      expect(response).to have_http_status(:ok)
      buyer1_messages = JSON.parse(response.body)['data']
      offer_message = buyer1_messages.find { |msg| msg['is_offer'] }
      expect(offer_message['offer_status']).to eq('pending') # 仍為待處理
    end

    it '砍價談判過程' do
      seller = create(:user, name: '車主', email: 'owner@test.com')
      buyer = create(:user, name: '買家', email: 'buyer@test.com')
      
      bike = create_test_bicycle(seller, {
        title: 'Specialized Allez',
        price: 18000,
        condition: 'good'
      })
      
      seller_token = api_sign_in(seller)
      buyer_token = api_sign_in(buyer)
      
      # 第一輪：買家詢價
      post '/api/v1/messages',
           headers: auth_headers(buyer_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bike.id,
               content: '請問這台車還在嗎？可以看車嗎？',
               is_offer: false
             }
           }
      
      expect(response).to have_http_status(:created)
      
      # 賣家回覆
      post '/api/v1/messages',
           headers: auth_headers(seller_token),
           params: {
             message: {
               recipient_id: buyer.id,
               bicycle_id: bike.id,
               content: '車還在，歡迎來看車。台北可約',
               is_offer: false
             }
           }
      
      # 第二輪：買家出低價試水溫
      post '/api/v1/messages',
           headers: auth_headers(buyer_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bike.id,
               content: '車況如何？能接受14000嗎？',
               is_offer: true,
               offer_amount: 14000
             }
           }
      
      expect(response).to have_http_status(:created)
      first_offer_id = JSON.parse(response.body)['data']['id']
      
      # 賣家拒絕第一次出價
      patch "/api/v1/messages/#{first_offer_id}/reject_offer",
            headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      
      # 第三輪：買家再次出價
      post '/api/v1/messages',
           headers: auth_headers(buyer_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bike.id,
               content: '那16000如何？真的很想要這台車',
               is_offer: true,
               offer_amount: 16000
             }
           }
      
      expect(response).to have_http_status(:created)
      second_offer_id = JSON.parse(response.body)['data']['id']
      
      # 賣家接受第二次出價
      patch "/api/v1/messages/#{second_offer_id}/accept_offer",
            headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      
      # 驗證整個對話歷史
      get "/api/v1/messages/conversations/#{buyer.id}",
          headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      messages = JSON.parse(response.body)['data']
      
      # 應該有：詢問、回覆、第一次出價、第二次出價等訊息
      expect(messages.length).to be >= 4
      
      # 驗證最終成交價格
      accepted_offer = messages.find { |msg| msg['offer_status'] == 'accepted' }
      expect(accepted_offer['offer_amount']).to eq(16000)
    end
  end

  describe '商品管理情境' do
    it '賣家同時管理多個商品的詢問' do
      seller = create(:user, name: '車行老闆', email: 'bikeshop@test.com')
      
      # 創建多台不同類型的車
      road_bike = create_test_bicycle(seller, {
        title: 'Giant TCR Advanced',
        price: 35000,
        condition: 'excellent'
      })
      
      mountain_bike = create_test_bicycle(seller, {
        title: 'Trek Fuel EX',
        price: 45000,
        condition: 'good'
      })
      
      city_bike = create_test_bicycle(seller, {
        title: '通勤折疊車',
        price: 12000,
        condition: 'fair'
      })
      
      # 創建不同的潛在買家
      road_buyer = create(:user, name: '公路車愛好者', email: 'roadie@test.com')
      mtb_buyer = create(:user, name: '山地車手', email: 'mtbiker@test.com')
      commuter = create(:user, name: '通勤族', email: 'commuter@test.com')
      serious_buyer = create(:user, name: '認真買家', email: 'serious@test.com')
      
      seller_token = api_sign_in(seller)
      road_buyer_token = api_sign_in(road_buyer)
      mtb_buyer_token = api_sign_in(mtb_buyer)
      commuter_token = api_sign_in(commuter)
      serious_buyer_token = api_sign_in(serious_buyer)
      
      # 多個買家同時詢問不同商品
      inquiries = [
        {
          buyer_token: road_buyer_token,
          buyer_id: road_buyer.id,
          bike: road_bike,
          message: '這台公路車的配置如何？有升級過嗎？',
          offer: 32000
        },
        {
          buyer_token: mtb_buyer_token,
          buyer_id: mtb_buyer.id,
          bike: mountain_bike,
          message: '想問這台山地車的避震器還好嗎？',
          offer: 40000
        },
        {
          buyer_token: commuter_token,
          buyer_id: commuter.id,
          bike: city_bike,
          message: '摺疊功能正常嗎？適合每天通勤嗎？',
          offer: 10000
        },
        {
          buyer_token: serious_buyer_token,
          buyer_id: serious_buyer.id,
          bike: road_bike,
          message: '可以直接原價買，什麼時候可以面交？',
          offer: 35000
        }
      ]
      
      # 發送所有詢問
      inquiries.each do |inquiry|
        # 先發一般詢問
        post '/api/v1/messages',
             headers: auth_headers(inquiry[:buyer_token]),
             params: {
               message: {
                 recipient_id: seller.id,
                 bicycle_id: inquiry[:bike].id,
                 content: inquiry[:message],
                 is_offer: false
               }
             }
        
        expect(response).to have_http_status(:created)
        
        # 再發出價
        post '/api/v1/messages',
             headers: auth_headers(inquiry[:buyer_token]),
             params: {
               message: {
                 recipient_id: seller.id,
                 bicycle_id: inquiry[:bike].id,
                 content: "出價 #{inquiry[:offer]}",
                 is_offer: true,
                 offer_amount: inquiry[:offer]
               }
             }
        
        expect(response).to have_http_status(:created)
      end
      
      # 賣家查看所有對話
      get '/api/v1/messages/conversations',
          headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      conversations = JSON.parse(response.body)['data']
      
      # 應該有4個對話（4個不同買家）
      expect(conversations.length).to eq(4)
      
      # 驗證每個對話都有對應的商品資訊
      bike_ids = conversations.map { |conv| conv['bicycle_id'] }.uniq
      expect(bike_ids).to contain_exactly(road_bike.id, mountain_bike.id, city_bike.id)
      
      # 賣家決定接受最高價的出價（認真買家的35000）
      serious_buyer_conversation = conversations.find do |conv|
        conv['with_user']['id'] == serious_buyer.id
      end
      
      expect(serious_buyer_conversation).to be_present
      
      # 查看與認真買家的詳細對話
      get "/api/v1/messages/conversations/#{serious_buyer.id}",
          headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      messages = JSON.parse(response.body)['data']
      
      offer_message = messages.find { |msg| msg['is_offer'] && msg['offer_amount'] == 35000 }
      expect(offer_message).to be_present
      
      # 接受這個出價
      patch "/api/v1/messages/#{offer_message['id']}/accept_offer",
            headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
    end
  end

  describe '詐騙防護情境' do
    it '防止虛假出價和惡意留言' do
      seller = create(:user, name: '正當賣家', email: 'honest@test.com')
      suspicious_buyer = create(:user, name: '可疑買家', email: 'suspicious@test.com')
      
      bike = create_test_bicycle(seller, {
        title: '高價位車款',
        price: 50000,
        condition: 'excellent'
      })
      
      seller_token = api_sign_in(seller)
      suspicious_token = api_sign_in(suspicious_buyer)
      
      # 可疑買家發送異常低價出價
      post '/api/v1/messages',
           headers: auth_headers(suspicious_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bike.id,
               content: '1000塊錢秒殺，要就私訊',
               is_offer: true,
               offer_amount: 1000
             }
           }
      
      expect(response).to have_http_status(:created)
      first_lowball_id = JSON.parse(response.body)['data']['id']
      
      # 賣家拒絕異常出價
      patch "/api/v1/messages/#{first_lowball_id}/reject_offer",
            headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      
      # 可疑買家再次發送垃圾訊息
      post '/api/v1/messages',
           headers: auth_headers(suspicious_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bike.id,
               content: '加我LINE討論 abc123，有更好的價格',
               is_offer: false
             }
           }
      
      expect(response).to have_http_status(:created)
      
      # 再次發送異常出價
      post '/api/v1/messages',
           headers: auth_headers(suspicious_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bike.id,
               content: '最終價2000，不賣算了',
               is_offer: true,
               offer_amount: 2000
             }
           }
      
      expect(response).to have_http_status(:created)
      second_lowball_id = JSON.parse(response.body)['data']['id']
      
      # 驗證賣家可以查看完整對話記錄以便檢舉
      get "/api/v1/messages/conversations/#{suspicious_buyer.id}",
          headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      messages = JSON.parse(response.body)['data']
      
      # 應該有3則訊息（2次出價 + 1次一般訊息）
      expect(messages.length).to eq(3)
      
      # 驗證可以識別異常出價
      low_offers = messages.select { |msg| msg['is_offer'] && msg['offer_amount'] < 10000 }
      expect(low_offers.length).to eq(2)
      
      # 賣家拒絕第二次異常出價
      patch "/api/v1/messages/#{second_lowball_id}/reject_offer",
            headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
    end

    it '防止出價後立即撤回的惡意行為' do
      seller = create(:user, name: '賣家', email: 'seller@test.com')
      flaky_buyer = create(:user, name: '反覆買家', email: 'flaky@test.com')
      
      bike = create_test_bicycle(seller, {
        title: '搶手車款',
        price: 20000,
        condition: 'good'
      })
      
      seller_token = api_sign_in(seller)
      flaky_token = api_sign_in(flaky_buyer)
      
      # 買家發送出價
      post '/api/v1/messages',
           headers: auth_headers(flaky_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bike.id,
               content: '我要了，19000可以嗎？',
               is_offer: true,
               offer_amount: 19000
             }
           }
      
      expect(response).to have_http_status(:created)
      offer_id = JSON.parse(response.body)['data']['id']
      
      # 買家嘗試再次對同一商品出價（應該被阻止）
      post '/api/v1/messages',
           headers: auth_headers(flaky_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bike.id,
               content: '我改出18000',
               is_offer: true,
               offer_amount: 18000
             }
           }
      
      # 應該被系統阻止，因為已有待處理的出價
      expect(response).to have_http_status(:unprocessable_entity)
      error_data = JSON.parse(response.body)
      expect(error_data['errors']).to include('您已經有一個待回應的出價，請等待對方回應或先撤回之前的出價')
      
      # 驗證原始出價仍然存在且為待處理狀態
      message = Message.find(offer_id)
      expect(message.offer_status).to eq('pending')
      expect(message.offer_amount).to eq(19000)
    end
  end

  describe '節慶促銷情境' do
    it '雙11促銷期間大量交易情境' do
      # 建立促銷活動商品
      seller = create(:user, name: '促銷賣家', email: 'promo@test.com')
      
      # 建立多個促銷商品
      promo_bikes = []
      5.times do |i|
        promo_bikes << create_test_bicycle(seller, {
          title: "雙11特價車款#{i + 1}",
          price: (15000 + i * 5000),
          condition: 'good'
        })
      end
      
      # 建立急需買車的買家們
      urgent_buyers = []
      10.times do |i|
        urgent_buyers << create(:user, name: "急需買家#{i + 1}", email: "urgent#{i + 1}@test.com")
      end
      
      seller_token = api_sign_in(seller)
      buyer_tokens = urgent_buyers.map { |buyer| api_sign_in(buyer) }
      
      # 模擬搶購情境：多個買家對同一台車出價
      target_bike = promo_bikes.first
      
      # 前5個買家出價
      offers = []
      urgent_buyers.first(5).each_with_index do |buyer, index|
        post '/api/v1/messages',
             headers: auth_headers(buyer_tokens[index]),
             params: {
               message: {
                 recipient_id: seller.id,
                 bicycle_id: target_bike.id,
                 content: "雙11搶購！出價#{14000 + index * 500}",
                 is_offer: true,
                 offer_amount: 14000 + index * 500
               }
             }
        
        expect(response).to have_http_status(:created)
        offers << JSON.parse(response.body)['data']['id']
      end
      
      # 後5個買家轉向其他商品
      urgent_buyers.last(5).each_with_index do |buyer, index|
        bike_index = index % (promo_bikes.length - 1) + 1
        
        post '/api/v1/messages',
             headers: auth_headers(buyer_tokens[index + 5]),
             params: {
               message: {
                 recipient_id: seller.id,
                 bicycle_id: promo_bikes[bike_index].id,
                 content: "這台也不錯，原價收",
                 is_offer: true,
                 offer_amount: promo_bikes[bike_index].price
               }
             }
        
        expect(response).to have_http_status(:created)
      end
      
      # 賣家查看所有對話
      get '/api/v1/messages/conversations',
          headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      conversations = JSON.parse(response.body)['data']
      
      # 應該有10個不同的對話
      expect(conversations.length).to eq(10)
      
      # 賣家接受最高價的出價（第5個買家：16000）
      patch "/api/v1/messages/#{offers.last}/accept_offer",
            headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      
      # 驗證其他對該商品的出價狀態
      target_bike_offers = Message.where(
        bicycle_id: target_bike.id,
        is_offer: true
      )
      
      accepted_count = target_bike_offers.where(offer_status: 'accepted').count
      pending_count = target_bike_offers.where(offer_status: 'pending').count
      
      expect(accepted_count).to eq(1)
      expect(pending_count).to eq(4) # 其他4個仍為待處理
    end
  end

  describe '客服情境' do
    it '交易糾紛處理流程' do
      seller = create(:user, name: '賣家', email: 'seller@test.com')
      buyer = create(:user, name: '買家', email: 'buyer@test.com')
      
      bike = create_test_bicycle(seller, {
        title: '有問題的車款',
        price: 15000,
        condition: 'good'
      })
      
      seller_token = api_sign_in(seller)
      buyer_token = api_sign_in(buyer)
      
      # 正常交易流程
      post '/api/v1/messages',
           headers: auth_headers(buyer_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bike.id,
               content: '我要這台車',
               is_offer: true,
               offer_amount: 15000
             }
           }
      
      expect(response).to have_http_status(:created)
      offer_id = JSON.parse(response.body)['data']['id']
      
      # 賣家接受出價
      patch "/api/v1/messages/#{offer_id}/accept_offer",
            headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      
      # 買家看車後發現問題
      post '/api/v1/messages',
           headers: auth_headers(buyer_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bike.id,
               content: '實際看車發現變速器有問題，跟照片描述不符',
               is_offer: false
             }
           }
      
      expect(response).to have_http_status(:created)
      
      # 賣家回應
      post '/api/v1/messages',
           headers: auth_headers(seller_token),
           params: {
             message: {
               recipient_id: buyer.id,
               bicycle_id: bike.id,
               content: '不好意思，我可以降價2000補償',
               is_offer: false
             }
           }
      
      expect(response).to have_http_status(:created)
      
      # 買家發送新的出價
      post '/api/v1/messages',
           headers: auth_headers(buyer_token),
           params: {
             message: {
               recipient_id: seller.id,
               bicycle_id: bike.id,
               content: '那13000可以接受',
               is_offer: true,
               offer_amount: 13000
             }
           }
      
      expect(response).to have_http_status(:created)
      new_offer_id = JSON.parse(response.body)['data']['id']
      
      # 賣家接受新價格
      patch "/api/v1/messages/#{new_offer_id}/accept_offer",
            headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      
      # 驗證對話記錄完整保存
      get "/api/v1/messages/conversations/#{buyer.id}",
          headers: auth_headers(seller_token)
      
      expect(response).to have_http_status(:ok)
      messages = JSON.parse(response.body)['data']
      
      # 應該包含：原始出價、問題反映、回應、新出價等訊息
      expect(messages.length).to be >= 4
      
      # 驗證最終成交價
      final_offer = messages.select { |msg| msg['is_offer'] }.last
      expect(final_offer['offer_status']).to eq('accepted')
      expect(final_offer['offer_amount']).to eq(13000)
    end
  end
end 