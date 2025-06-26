# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V1::OrdersController, type: :controller do
  let(:user) { create(:user) }
  let(:seller) { create(:user, :with_bank_account) }
  let(:bicycle) { create(:bicycle, user: seller, status: :available) }
  let(:order) { create(:order, user: user, bicycle: bicycle) }

  before do
    sign_in user
    request.headers['Accept'] = 'application/vnd.api+json'
    request.headers['Content-Type'] = 'application/vnd.api+json'
  end

  describe 'GET #index' do
    let!(:orders) { create_list(:order, 3, user: user) }

    it '回傳使用者的訂單列表' do
      get :index
      
      expect(response).to have_http_status(:ok)
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(3)
      expect(json_response['meta']).to include('total_count', 'current_page', 'total_pages')
    end

    it '支援分頁參數' do
      get :index, params: { page: 1, per_page: 2 }
      
      expect(response).to have_http_status(:ok)
      expect(json_response['data'].length).to eq(2)
      expect(json_response['meta']['per_page']).to eq(2)
    end
  end

  describe 'GET #show' do
    it '回傳指定的訂單詳情' do
      get :show, params: { id: order.id }
      
      expect(response).to have_http_status(:ok)
      expect(json_response['data']['id']).to eq(order.id.to_s)
      expect(json_response['data']['attributes']).to include(
        'order_number',
        'total_price',
        'status',
        'payment_status'
      )
    end

    it '可以透過 order_number 查詢訂單' do
      get :show, params: { id: order.order_number }

      expect(response).to have_http_status(:ok)
      expect(json_response['data']['id']).to eq(order.id.to_s)
    end

    it '當訂單不存在時回傳 404' do
      get :show, params: { id: 'nonexistent' }
      
      expect(response).to have_http_status(:not_found)
      expect(json_response['errors'].first['detail']).to eq('Order not found')
    end

    it '不允許存取其他使用者的訂單' do
      other_user_order = create(:order)
      
      get :show, params: { id: other_user_order.id }
      
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST #create' do
    let(:valid_order_params) do
      {
        order: {
          bicycle_id: bicycle.id,
          total_price: 15000,
          payment_method: 'bank_transfer',
          shipping_method: 'assisted_delivery',
          shipping_distance: 5,
          shipping_address: {
            full_name: '王小明',
            phone_number: '0912345678',
            county: '台北市',
            district: '信義區',
            address_line1: '信義路五段7號',
            address_line2: '10樓',
            postal_code: '110',
            delivery_notes: '請在上班時間送達'
          },
          payment_details: {
            transfer_note: '訂單付款',
            account_last_five_digits: '12345'
          },
          delivery_option: {
            type: 'delivery',
            cost: 100,
            estimated_days_min: 3,
            estimated_days_max: 5
          }
        }
      }
    end

    context '使用有效參數' do
      it '成功創建訂單' do
        expect {
          post :create, params: valid_order_params
        }.to change(Order, :count).by(1)
        
        expect(response).to have_http_status(:created)
        expect(json_response['data']['attributes']).to include(
          'order_number',
          'total_price',
          'status',
          'payment_status'
        )
        
        new_order = Order.last
        expect(new_order.user).to eq(user)
        expect(new_order.bicycle).to eq(bicycle)
        expect(new_order.status).to eq('pending')
        expect(new_order.payment_status).to eq('pending')
      end

      it '設定正確的運費' do
        post :create, params: valid_order_params
        
        new_order = Order.last
        expect(new_order.shipping_cost).to be > 0
      end

      it '生成付款說明' do
        post :create, params: valid_order_params
        
        new_order = Order.last
        expect(new_order.payment_instructions).to be_present
        expect(new_order.company_account_info).to include(new_order.order_number)
      end
    end

    context '使用無效參數' do
      it '當自行車不存在時回傳錯誤' do
        invalid_params = valid_order_params.deep_dup
        invalid_params[:order][:bicycle_id] = 'nonexistent'
        
        post :create, params: invalid_params
        
        expect(response).to have_http_status(:not_found)
        expect(json_response['errors'].first['detail']).to eq('Bicycle not found')
      end

      it '當自行車不可購買時回傳錯誤' do
        bicycle.update!(status: :sold)
        
        post :create, params: valid_order_params
        
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['errors'].first['detail']).to eq('Bicycle is not available for purchase')
      end

      it '當缺少必要參數時回傳錯誤' do
        invalid_params = valid_order_params.deep_dup
        invalid_params[:order].delete(:bicycle_id)
        
        post :create, params: invalid_params
        
        expect(response).to have_http_status(:not_found)
        expect(json_response['errors'].first['detail']).to eq('Bicycle not found')
      end
    end
  end

  describe 'PATCH #update' do
    let(:update_params) do
      {
        id: order.id,
        order: {
          status: 'processing',
          tracking_number: 'TRK123456789',
          carrier: '黑貓宅急便'
        }
      }
    end

    it '更新訂單狀態' do
      patch :update, params: update_params
      
      expect(response).to have_http_status(:ok)
      order.reload
      expect(order.status).to eq('processing')
      expect(order.tracking_number).to eq('TRK123456789')
      expect(order.carrier).to eq('黑貓宅急便')
    end

    it '不允許更新其他使用者的訂單' do
      other_user_order = create(:order)
      
      patch :update, params: { id: other_user_order.id, order: { status: 'processing' } }
      
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PUT #complete' do
    before { order.update!(status: :delivered, payment_status: :paid) }

    it '將訂單標記為完成' do
      put :complete, params: { id: order.id }
      
      expect(response).to have_http_status(:ok)
      order.reload
      expect(order.status).to eq('completed')
    end

    it '不允許完成其他使用者的訂單' do
      other_user_order = create(:order)
      
      put :complete, params: { id: other_user_order.id }
      
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PUT #cancel' do
    let(:cancel_params) do
      {
        id: order.id,
        reason: '商品有瑕疵'
      }
    end

    it '取消訂單' do
      put :cancel, params: cancel_params
      
      expect(response).to have_http_status(:ok)
      order.reload
      expect(order.status).to eq('cancelled')
      expect(order.cancel_reason).to eq('商品有瑕疵')
    end

    it '不允許取消其他使用者的訂單' do
      other_user_order = create(:order)
      
      put :cancel, params: { id: other_user_order.id, reason: '測試取消' }
      
      expect(response).to have_http_status(:not_found)
    end
  end

  private

  def json_response
    JSON.parse(response.body)
  end
end 