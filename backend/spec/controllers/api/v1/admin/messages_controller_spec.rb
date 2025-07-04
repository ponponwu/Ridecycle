require 'rails_helper'

RSpec.describe Api::V1::Admin::MessagesController, type: :controller do
  let(:admin_user) { create(:user, admin: true) }
  let(:regular_user) { create(:user, admin: false) }
  let(:sender) { create(:user) }
  let(:receiver) { create(:user) }
  let(:bicycle) { create(:bicycle, user: receiver) }
  
  let!(:message1) { create(:message, sender: sender, receiver: receiver, bicycle: bicycle, content: "Hello") }
  let!(:message2) { create(:message, sender: receiver, receiver: sender, bicycle: bicycle, content: "Hi back") }
  let!(:offer_message) { create(:message, sender: sender, receiver: receiver, bicycle: bicycle, content: "Offer", is_offer: true, offer_amount: 500) }

  before do
    sign_in admin_user
  end

  describe 'GET #index' do
    context 'when user is admin' do
      it 'returns all messages' do
        get :index
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['data']).to be_an(Array)
        expect(json_response['data'].length).to eq(3)
      end

      it 'includes message statistics in meta' do
        get :index
        json_response = JSON.parse(response.body)
        expect(json_response['meta']).to include('total_count', 'unread_count', 'offer_count')
        expect(json_response['meta']['offer_count']).to eq(1)
      end

      it 'includes sender, receiver, and bicycle data' do
        get :index
        json_response = JSON.parse(response.body)
        message_data = json_response['data'].first
        expect(message_data).to include('sender', 'receiver', 'bicycle')
        expect(message_data['sender']).to include('id', 'full_name', 'email')
        expect(message_data['bicycle']).to include('id', 'title')
      end

      it 'respects limit parameter' do
        get :index, params: { limit: 2 }
        json_response = JSON.parse(response.body)
        expect(json_response['data'].length).to eq(2)
      end

      it 'orders messages by created_at desc' do
        get :index
        json_response = JSON.parse(response.body)
        messages = json_response['data']
        expect(messages.first['id']).to eq(offer_message.id)
        expect(messages.last['id']).to eq(message1.id)
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

  describe 'GET #conversations' do
    context 'when user is admin' do
      context 'with valid parameters' do
        it 'returns conversation messages' do
          get :conversations, params: { 
            bicycle_id: bicycle.id, 
            sender_id: sender.id, 
            receiver_id: receiver.id 
          }
          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response['data']).to be_an(Array)
          expect(json_response['data'].length).to eq(3) # All messages between sender and receiver
        end

        it 'includes conversation metadata' do
          get :conversations, params: { 
            bicycle_id: bicycle.id, 
            sender_id: sender.id, 
            receiver_id: receiver.id 
          }
          json_response = JSON.parse(response.body)
          expect(json_response['meta']).to include('conversation_id', 'bicycle_id', 'participants', 'message_count')
          expect(json_response['meta']['participants']).to include(sender.id.to_s, receiver.id.to_s)
        end

        it 'orders messages by created_at asc' do
          get :conversations, params: { 
            bicycle_id: bicycle.id, 
            sender_id: sender.id, 
            receiver_id: receiver.id 
          }
          json_response = JSON.parse(response.body)
          messages = json_response['data']
          expect(messages.first['id']).to eq(message1.id)
          expect(messages.last['id']).to eq(offer_message.id)
        end

        it 'includes full message data' do
          get :conversations, params: { 
            bicycle_id: bicycle.id, 
            sender_id: sender.id, 
            receiver_id: receiver.id 
          }
          json_response = JSON.parse(response.body)
          message_data = json_response['data'].first
          expect(message_data).to include('content', 'sender', 'receiver', 'bicycle')
          expect(message_data).to include('is_offer', 'offer_amount', 'offer_status')
        end
      end

      context 'with missing parameters' do
        it 'returns bad request when bicycle_id is missing' do
          get :conversations, params: { sender_id: sender.id, receiver_id: receiver.id }
          expect(response).to have_http_status(:bad_request)
        end

        it 'returns bad request when sender_id is missing' do
          get :conversations, params: { bicycle_id: bicycle.id, receiver_id: receiver.id }
          expect(response).to have_http_status(:bad_request)
        end

        it 'returns bad request when receiver_id is missing' do
          get :conversations, params: { bicycle_id: bicycle.id, sender_id: sender.id }
          expect(response).to have_http_status(:bad_request)
        end
      end

      context 'with no matching messages' do
        let(:other_user) { create(:user) }

        it 'returns empty array' do
          get :conversations, params: { 
            bicycle_id: bicycle.id, 
            sender_id: other_user.id, 
            receiver_id: receiver.id 
          }
          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response['data']).to be_an(Array)
          expect(json_response['data'].length).to eq(0)
        end
      end
    end

    context 'when user is not admin' do
      before do
        sign_in regular_user
      end

      it 'returns forbidden' do
        get :conversations, params: { 
          bicycle_id: bicycle.id, 
          sender_id: sender.id, 
          receiver_id: receiver.id 
        }
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'error handling' do
    context 'when database error occurs' do
      before do
        allow(Message).to receive(:includes).and_raise(StandardError.new("Database error"))
      end

      it 'returns internal server error for index' do
        get :index
        expect(response).to have_http_status(:internal_server_error)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Failed to fetch messages')
      end

      it 'returns internal server error for conversations' do
        get :conversations, params: { 
          bicycle_id: bicycle.id, 
          sender_id: sender.id, 
          receiver_id: receiver.id 
        }
        expect(response).to have_http_status(:internal_server_error)
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('Failed to fetch conversation')
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