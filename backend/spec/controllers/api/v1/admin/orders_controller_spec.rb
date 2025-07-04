require 'rails_helper'

RSpec.describe Api::V1::Admin::OrdersController, type: :controller do
  let(:admin_user) { create(:user, :admin) }
  let(:regular_user) { create(:user) }
  let(:seller) { create(:user) }
  let(:bicycle) { create(:bicycle, user: seller, status: :available) }
  let(:order) { create(:order, user: regular_user, bicycle: bicycle, status: :processing) }
  let(:payment) { create(:order_payment, order: order, status: :paid) }

  before do
    # Ensure bicycle is reserved and payment is paid
    bicycle.update!(status: :reserved)
    request.headers['Authorization'] = "Bearer #{jwt_token_for(admin_user)}"
  end

  describe 'GET #index' do
    it 'returns orders for admin' do
      get :index, format: :json
      expect(response).to have_http_status(:ok)
      expect(response_data).to be_an(Array)
    end

    it 'denies access for non-admin users' do
      request.headers['Authorization'] = "Bearer #{jwt_token_for(regular_user)}"
      get :index, format: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'GET #show' do
    it 'returns order details for admin' do
      get :show, params: { id: order.id }, format: :json
      expect(response).to have_http_status(:ok)
      expect(response_data['attributes']['order_number']).to eq(order.order_number)
    end
  end

  describe 'PATCH #approve_sale' do
    context 'when order can be approved' do
      before do
        # Ensure payment is paid and bicycle is reserved
        payment.update!(status: :paid)
        bicycle.update!(status: :reserved)
      end

      it 'approves the sale and marks bicycle as sold' do
        expect {
          patch :approve_sale, params: { id: order.id }, format: :json
        }.to change { bicycle.reload.status }.from('reserved').to('sold')
         .and change { order.reload.status }.from('processing').to('completed')

        expect(response).to have_http_status(:ok)
        expect(response_data['attributes']['bicycle_status']).to eq('sold')
      end
    end

    context 'when order cannot be approved' do
      before do
        payment.update!(status: :pending)
      end

      it 'returns error when payment is not confirmed' do
        patch :approve_sale, params: { id: order.id }, format: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe 'PATCH #reject_sale' do
    context 'when payment is confirmed' do
      before do
        payment.update!(status: :paid)
        bicycle.update!(status: :reserved)
      end

      it 'rejects the sale and restores bicycle to available' do
        expect {
          patch :reject_sale, params: { id: order.id, reason: 'Quality issue' }, format: :json
        }.to change { bicycle.reload.status }.from('reserved').to('available')
         .and change { order.reload.status }.from('processing').to('cancelled')
         .and change { payment.reload.status }.from('paid').to('refunded')

        expect(response).to have_http_status(:ok)
        expect(response_data['attributes']['bicycle_status']).to eq('available')
      end
    end

    context 'when payment is not confirmed' do
      before do
        payment.update!(status: :pending)
      end

      it 'returns error when payment is not confirmed' do
        patch :reject_sale, params: { id: order.id }, format: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  private

  def response_data
    JSON.parse(response.body)['data']
  end

  def jwt_token_for(user)
    JWT.encode({ user_id: user.id }, Rails.application.credentials.secret_key_base)
  end
end