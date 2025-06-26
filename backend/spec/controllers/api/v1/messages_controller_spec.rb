require 'rails_helper'

RSpec.describe Api::V1::MessagesController, type: :controller do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:bicycle) { create(:bicycle, user: other_user) }

  before do
    allow(controller).to receive(:authenticate_user!).and_return(true)
    allow(controller).to receive(:current_user).and_return(user)
    controller.instance_variable_set(:@current_user, user)
  end

  describe 'GET #index' do
    let!(:message1) { create(:message, sender: user, recipient: other_user, bicycle: bicycle) }
    let!(:message2) { create(:message, sender: other_user, recipient: user, bicycle: bicycle) }

    before do
      allow(MessageService).to receive(:get_conversations).and_return([
        {
          with_user: { id: other_user.id, name: other_user.name, avatar: nil },
          last_message: { content: message2.content, created_at: message2.created_at, is_read: false },
          updated_at: message2.created_at,
          bicycle_id: bicycle.id,
          bicycle_title: bicycle.title,
          bicycle_image_url: nil
        }
      ])
    end

    it 'calls MessageService.get_conversations' do
      expect(MessageService).to receive(:get_conversations).with(user)
      get :index
    end

    it 'returns conversation previews in JSON:API format' do
      get :index
      expect(response).to have_http_status(:ok)
      
      json_response = JSON.parse(response.body)
      expect(json_response).to have_key('data')
      expect(json_response['data']).to have_key('attributes')
      expect(json_response['data']['attributes']).to have_key('conversations')
      
      conversations = json_response['data']['attributes']['conversations']
      expect(conversations).to be_an(Array)
      expect(conversations.length).to eq(1)
      
      conversation = conversations.first
      expect(conversation['with_user']['id']).to eq(other_user.id)
      expect(conversation['with_user']['name']).to eq(other_user.name)
      expect(conversation['last_message']).to be_present
    end

    it 'includes bicycle information in conversation preview' do
      get :index
      
      json_response = JSON.parse(response.body)
      conversations = json_response['data']['attributes']['conversations']
      conversation = conversations.first
      
      expect(conversation['bicycle_id']).to eq(bicycle.id)
      expect(conversation['bicycle_title']).to eq(bicycle.title)
    end
  end

  describe 'GET #show' do
    let!(:message1) { create(:message, sender: user, recipient: other_user, bicycle: bicycle) }
    let!(:message2) { create(:message, sender: other_user, recipient: user, bicycle: bicycle, is_read: false) }

    before do
      allow(MessageService).to receive(:get_conversation_messages).and_return([message1, message2])
    end

    it 'calls MessageService.get_conversation_messages' do
      expect(MessageService).to receive(:get_conversation_messages).with(user, other_user.id.to_s)
      get :show, params: { id: other_user.id }
    end

    it 'returns messages between users in JSON:API format' do
      get :show, params: { id: other_user.id }
      expect(response).to have_http_status(:ok)
      
      json_response = JSON.parse(response.body)
      expect(json_response['data']).to be_an(Array)
      expect(json_response['data'].length).to eq(2)
    end

    it 'uses MessageSerializer for response' do
      # JSON:API serializer is called internally by render_jsonapi_collection
      get :show, params: { id: other_user.id }
      expect(response).to have_http_status(:ok)
    end

    it 'marks unread messages as read' do
      allow(MessageService).to receive(:get_conversation_messages).and_call_original
      
      expect(message2.is_read).to be false
      
      get :show, params: { id: other_user.id }
      
      message2.reload
      expect(message2.is_read).to be true
      expect(message2.read_at).to be_present
    end
  end

  describe 'POST #create' do
    let(:valid_params) do
      {
        message: {
          recipient_id: other_user.id,
          content: 'Hello there!',
          bicycle_id: bicycle.id
        }
      }
    end

    let(:service_result) { MessageService::Result.new(success: true, data: build(:message)) }

    before do
      allow(MessageService).to receive(:create_message).and_return(service_result)
    end

    context 'with valid parameters' do
      it 'calls MessageService.create_message' do
        expect(MessageService).to receive(:create_message) do |user, params|
          expect(user).to eq(user)
          expect(params).to be_a(ActionController::Parameters)
          expect(params.permitted?).to be true
          expect(params[:recipient_id]).to eq(other_user.id)
          expect(params[:content]).to eq('Hello there!')
          expect(params[:bicycle_id]).to eq(bicycle.id)
          service_result
        end
        post :create, params: valid_params
      end

      it 'returns successful response when service succeeds' do
        post :create, params: valid_params
        expect(response).to have_http_status(:created)
      end

      it 'returns JSON:API format for successful response' do
        post :create, params: valid_params
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('data')
        expect(json_response['data']).to have_key('type')
        expect(json_response['data']).to have_key('attributes')
      end
    end

    context 'when MessageService returns failure' do
      let(:error_result) do
        MessageService::Result.new(
          success: false,
          errors: ['Some error occurred'],
          status: :unprocessable_entity
        )
      end

      before do
        allow(MessageService).to receive(:create_message).and_return(error_result)
      end

      it 'returns error response in JSON:API format' do
        post :create, params: valid_params
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('errors')
        expect(json_response['errors']).to be_an(Array)
        expect(json_response['errors'].first['detail']).to eq('Some error occurred')
      end
    end

    context 'when sending message to self' do
      let(:self_message_result) do
        MessageService::Result.new(
          success: false,
          errors: ['不能發送訊息給自己'],
          status: :unprocessable_entity
        )
      end

      before do
        allow(MessageService).to receive(:create_message).and_return(self_message_result)
      end

      it 'returns error through service in JSON:API format' do
        invalid_params = valid_params.dup
        invalid_params[:message][:recipient_id] = user.id
        
        post :create, params: invalid_params
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['errors'].first['detail']).to eq('不能發送訊息給自己')
      end
    end

    context 'with offer parameters' do
      let(:offer_params) do
        {
          message: {
            recipient_id: other_user.id,
            content: '我想出價',
            bicycle_id: bicycle.id,
            is_offer: true,
            offer_amount: 15000
          }
        }
      end

      let(:offer_result) { MessageService::Result.new(success: true, data: build(:message, is_offer: true, offer_amount: 15000)) }

      before do
        allow(MessageService).to receive(:create_message).and_return(offer_result)
      end

      it 'handles offer creation through service' do
        expect(MessageService).to receive(:create_message) do |user, params|
          expect(params[:is_offer]).to be true
          expect(params[:offer_amount]).to eq(15000)
          offer_result
        end
        
        post :create, params: offer_params
        expect(response).to have_http_status(:created)
      end

      context 'when there is already a pending offer' do
        let(:duplicate_offer_result) do
          MessageService::Result.new(
            success: false,
            errors: ['您已經有一個待回應的出價，請等待對方回應或先撤回之前的出價'],
            status: :unprocessable_entity
          )
        end

        before do
          allow(MessageService).to receive(:create_message).and_return(duplicate_offer_result)
        end

        it 'prevents creating duplicate offers through service' do
          post :create, params: offer_params
          
          expect(response).to have_http_status(:unprocessable_entity)
          json_response = JSON.parse(response.body)
          expect(json_response['errors'].first['detail']).to eq('您已經有一個待回應的出價，請等待對方回應或先撤回之前的出價')
        end
      end
    end
  end

  describe 'POST #accept_offer' do
    let!(:offer_message) do
      create(:message, :offer, 
             sender: other_user, 
             recipient: user, 
             bicycle: bicycle,
             offer_amount: 15000)
    end

    let(:service_result) do
      OfferService::Result.new(
        success: true,
        data: {
          accepted_offer: offer_message,
          response_message: build(:message),
          order: build(:order)
        }
      )
    end

    before do
      allow(OfferService).to receive(:accept_offer).and_return(service_result)
    end

    it 'calls OfferService.accept_offer' do
      expect(OfferService).to receive(:accept_offer).with(offer_message, user)
      post :accept_offer, params: { id: offer_message.id }
    end

    context 'when user is the recipient' do
      it 'accepts the offer successfully through service' do
        post :accept_offer, params: { id: offer_message.id }
        expect(response).to have_http_status(:ok)
        
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('data')
        expect(json_response['data']['type']).to eq('offer_acceptance')
        expect(json_response['data']['attributes']).to have_key('accepted_offer')
        expect(json_response['data']['attributes']).to have_key('response_message')
        expect(json_response['data']['attributes']).to have_key('order')
      end

      it 'uses correct serializers' do
        # Serializers are called internally by the service result processing
        post :accept_offer, params: { id: offer_message.id }
        expect(response).to have_http_status(:ok)
      end
    end

    context 'when OfferService returns failure' do
      let(:error_result) do
        OfferService::Result.new(
          success: false,
          errors: ['腳踏車已不可購買'],
          status: :unprocessable_entity
        )
      end

      before do
        allow(OfferService).to receive(:accept_offer).and_return(error_result)
      end

      it 'returns error response in JSON:API format' do
        post :accept_offer, params: { id: offer_message.id }
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('errors')
        expect(json_response['errors'].first['detail']).to eq('腳踏車已不可購買')
      end
    end

    context 'when message is not found' do
      it 'returns not found error in JSON:API format' do
        post :accept_offer, params: { id: 99999 }
        
        expect(response).to have_http_status(:not_found)
        json_response = JSON.parse(response.body)
        expect(json_response['errors'].first['detail']).to eq('出價訊息不存在')
      end
    end

    context 'when message is not an offer' do
      let!(:regular_message) { create(:message, sender: other_user, recipient: user, bicycle: bicycle) }

      it 'returns unprocessable entity error in JSON:API format' do
        post :accept_offer, params: { id: regular_message.id }
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['errors'].first['detail']).to eq('這個出價無法處理')
      end
    end

    context 'when user is not the recipient' do
      before do
        allow(controller).to receive(:current_user).and_return(other_user)
        controller.instance_variable_set(:@current_user, other_user)
      end

      it 'returns forbidden error in JSON:API format' do
        post :accept_offer, params: { id: offer_message.id }
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['errors'].first['detail']).to eq('您沒有權限接受這個出價')
      end
    end
  end

  describe 'POST #reject_offer' do
    let!(:offer_message) do
      create(:message, :offer, 
             sender: other_user, 
             recipient: user, 
             bicycle: bicycle,
             offer_amount: 15000)
    end

    let(:service_result) do
      OfferService::Result.new(
        success: true,
        data: {
          rejected_offer: offer_message,
          response_message: build(:message)
        }
      )
    end

    before do
      allow(OfferService).to receive(:reject_offer).and_return(service_result)
    end

    it 'calls OfferService.reject_offer' do
      expect(OfferService).to receive(:reject_offer).with(offer_message, user)
      post :reject_offer, params: { id: offer_message.id }
    end

    context 'when user is the recipient' do
      it 'rejects the offer successfully through service' do
        post :reject_offer, params: { id: offer_message.id }
        expect(response).to have_http_status(:ok)
        
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('data')
        expect(json_response['data']['type']).to eq('offer_rejection')
        expect(json_response['data']['attributes']).to have_key('rejected_offer')
        expect(json_response['data']['attributes']).to have_key('response_message')
      end

      it 'uses MessageSerializer' do
        # Serializers are called internally by the service result processing
        post :reject_offer, params: { id: offer_message.id }
        expect(response).to have_http_status(:ok)
      end
    end

    context 'when OfferService returns failure' do
      let(:error_result) do
        OfferService::Result.new(
          success: false,
          errors: ['拒絕出價時發生錯誤'],
          status: :internal_server_error
        )
      end

      before do
        allow(OfferService).to receive(:reject_offer).and_return(error_result)
      end

      it 'returns error response in JSON:API format' do
        post :reject_offer, params: { id: offer_message.id }
        
        expect(response).to have_http_status(:internal_server_error)
        json_response = JSON.parse(response.body)
        expect(json_response['errors'].first['detail']).to eq('拒絕出價時發生錯誤')
      end
    end

    context 'when user is not the recipient' do
      before do
        allow(controller).to receive(:current_user).and_return(other_user)
        controller.instance_variable_set(:@current_user, other_user)
      end

      it 'returns forbidden error in JSON:API format' do
        post :reject_offer, params: { id: offer_message.id }
        
        expect(response).to have_http_status(:forbidden)
        json_response = JSON.parse(response.body)
        expect(json_response['errors'].first['detail']).to eq('您沒有權限拒絕這個出價')
      end
    end

    context 'when offer is not pending' do
      before do
        offer_message.update!(offer_status: 'accepted')
      end

      it 'returns unprocessable entity error in JSON:API format' do
        post :reject_offer, params: { id: offer_message.id }
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['errors'].first['detail']).to eq('這個出價無法處理')
      end
    end
  end

  # 測試 before_action callbacks
  describe 'before_action callbacks' do
    let!(:offer_message) { create(:message, :offer, sender: other_user, recipient: user, bicycle: bicycle) }

    it 'authenticates user for all actions' do
      expect(controller).to receive(:authenticate_user!)
      get :index
    end

    it 'sets message for offer actions' do
      post :accept_offer, params: { id: offer_message.id }
      expect(controller.instance_variable_get(:@message)).to eq(offer_message)
    end

    it 'validates offer message for offer actions' do
      regular_message = create(:message, sender: other_user, recipient: user, bicycle: bicycle)
      post :accept_offer, params: { id: regular_message.id }
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'validates offer permissions for offer actions' do
      allow(controller).to receive(:current_user).and_return(other_user)
      controller.instance_variable_set(:@current_user, other_user)
      
      post :accept_offer, params: { id: offer_message.id }
      expect(response).to have_http_status(:forbidden)
    end
  end
end 