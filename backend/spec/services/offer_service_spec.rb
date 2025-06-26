require 'rails_helper'

RSpec.describe OfferService, type: :service do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:bicycle) { create(:bicycle, user: user, status: 'available') }

  describe '.accept_offer' do
    let!(:offer_message) do
      create(:message, :offer,
             sender: other_user,
             recipient: user,
             bicycle: bicycle,
             offer_amount: 15000,
             offer_status: 'pending')
    end

    context 'with valid offer' do
      it 'accepts the offer successfully' do
        result = OfferService.accept_offer(offer_message, user)
        
        expect(result).to be_success
        expect(result.data[:accepted_offer]).to eq(offer_message)
        expect(result.data[:response_message]).to be_a(Message)
        expect(result.data[:order]).to be_a(Order)
      end

      it 'updates offer status to accepted' do
        OfferService.accept_offer(offer_message, user)
        
        offer_message.reload
        expect(offer_message.offer_status).to eq('accepted')
      end

      it 'updates bicycle status to sold' do
        OfferService.accept_offer(offer_message, user)
        
        bicycle.reload
        expect(bicycle.status).to eq('sold')
      end

      it 'creates an order' do
        expect {
          OfferService.accept_offer(offer_message, user)
        }.to change(Order, :count).by(1)
        
        order = Order.last
        expect(order.user).to eq(other_user)
        expect(order.bicycle).to eq(bicycle)
        expect(order.total_price).to eq(15000)
        expect(order.status).to eq('pending')
        expect(order.payment_status).to eq('pending')
      end

      it 'creates a response message' do
        expect {
          OfferService.accept_offer(offer_message, user)
        }.to change(Message, :count).by(1)
        
        response_message = Message.last
        expect(response_message.sender).to eq(user)
        expect(response_message.recipient).to eq(other_user)
        expect(response_message.bicycle).to eq(bicycle)
        expect(response_message.content).to include('我接受了您的出價')
        expect(response_message.content).to include('NT$15,000')
        expect(response_message.content).to include('訂單編號')
      end

      it 'rejects other pending offers for the same bicycle' do
        another_user = create(:user)
        other_offer = create(:message, :offer,
                           sender: another_user,
                           recipient: user,
                           bicycle: bicycle,
                           offer_status: 'pending')
        
        OfferService.accept_offer(offer_message, user)
        
        other_offer.reload
        expect(other_offer.offer_status).to eq('rejected')
      end

      it 'performs all operations in a transaction' do
        allow(offer_message).to receive(:accept_offer!).and_raise(StandardError, 'Test error')
        
        expect {
          OfferService.accept_offer(offer_message, user)
        }.not_to change(Order, :count)
        
        bicycle.reload
        expect(bicycle.status).to eq('available')
      end
    end

    context 'when offer validation fails' do
      context 'when message is nil' do
        it 'returns failure result' do
          result = OfferService.accept_offer(nil, user)
          
          expect(result).to be_failure
          expect(result.errors).to include('出價訊息不存在')
          expect(result.status).to eq(:not_found)
        end
      end

      context 'when sender does not exist' do
        before do
          allow(offer_message).to receive(:sender).and_return(nil)
        end

        it 'returns failure result' do
          result = OfferService.accept_offer(offer_message, user)
          
          expect(result).to be_failure
          expect(result.errors).to include('出價發送者不存在')
          expect(result.status).to eq(:unprocessable_entity)
        end
      end

      context 'when user is not the recipient' do
        let(:wrong_user) { create(:user) }

        it 'returns failure result' do
          result = OfferService.accept_offer(offer_message, wrong_user)
          
          expect(result).to be_failure
          expect(result.errors).to include('您沒有權限接受這個出價')
          expect(result.status).to eq(:forbidden)
        end
      end

      context 'when message is not an offer' do
        let(:regular_message) { create(:message, sender: other_user, recipient: user, bicycle: bicycle) }

        it 'returns failure result' do
          result = OfferService.accept_offer(regular_message, user)
          
          expect(result).to be_failure
          expect(result.errors).to include('這個出價無法被接受')
          expect(result.status).to eq(:unprocessable_entity)
        end
      end

      context 'when offer is not pending' do
        before { offer_message.update!(offer_status: 'accepted') }

        it 'returns failure result' do
          result = OfferService.accept_offer(offer_message, user)
          
          expect(result).to be_failure
          expect(result.errors).to include('這個出價無法被接受')
          expect(result.status).to eq(:unprocessable_entity)
        end
      end

      context 'when bicycle is not available' do
        before { bicycle.update!(status: 'sold') }

        it 'returns failure result' do
          result = OfferService.accept_offer(offer_message, user)
          
          expect(result).to be_failure
          expect(result.errors).to include('腳踏車已不可購買')
          expect(result.status).to eq(:unprocessable_entity)
        end
      end
    end

    context 'when an error occurs during processing' do
      before do
        allow(Order).to receive(:create!).and_raise(StandardError, 'Database error')
      end

      it 'returns failure result' do
        result = OfferService.accept_offer(offer_message, user)
        
        expect(result).to be_failure
        expect(result.errors).to include('接受出價時發生錯誤: Database error')
        expect(result.status).to eq(:internal_server_error)
      end

      it 'logs the error' do
        expect(Rails.logger).to receive(:error).with('接受出價時發生錯誤: Database error')
        expect(Rails.logger).to receive(:error).with(kind_of(String)) # backtrace
        
        OfferService.accept_offer(offer_message, user)
      end
    end
  end

  describe '.reject_offer' do
    let!(:offer_message) do
      create(:message, :offer,
             sender: other_user,
             recipient: user,
             bicycle: bicycle,
             offer_amount: 15000,
             offer_status: 'pending')
    end

    context 'with valid offer' do
      it 'rejects the offer successfully' do
        result = OfferService.reject_offer(offer_message, user)
        
        expect(result).to be_success
        expect(result.data[:rejected_offer]).to eq(offer_message)
        expect(result.data[:response_message]).to be_a(Message)
      end

      it 'updates offer status to rejected' do
        OfferService.reject_offer(offer_message, user)
        
        offer_message.reload
        expect(offer_message.offer_status).to eq('rejected')
      end

      it 'does not update bicycle status' do
        OfferService.reject_offer(offer_message, user)
        
        bicycle.reload
        expect(bicycle.status).to eq('available')
      end

      it 'does not create an order' do
        expect {
          OfferService.reject_offer(offer_message, user)
        }.not_to change(Order, :count)
      end

      it 'creates a response message' do
        expect {
          OfferService.reject_offer(offer_message, user)
        }.to change(Message, :count).by(1)
        
        response_message = Message.last
        expect(response_message.sender).to eq(user)
        expect(response_message.recipient).to eq(other_user)
        expect(response_message.bicycle).to eq(bicycle)
        expect(response_message.content).to include('很抱歉，我拒絕了您的出價')
        expect(response_message.content).to include('NT$15,000')
      end

      it 'performs all operations in a transaction' do
        allow(offer_message).to receive(:reject_offer!).and_raise(StandardError, 'Test error')
        
        expect {
          OfferService.reject_offer(offer_message, user)
        }.not_to change(Message, :count)
      end
    end

    context 'when offer validation fails' do
      context 'when user is not the recipient' do
        let(:wrong_user) { create(:user) }

        it 'returns failure result' do
          result = OfferService.reject_offer(offer_message, wrong_user)
          
          expect(result).to be_failure
          expect(result.errors).to include('您沒有權限拒絕這個出價')
          expect(result.status).to eq(:forbidden)
        end
      end

      context 'when offer is not pending' do
        before { offer_message.update!(offer_status: 'rejected') }

        it 'returns failure result' do
          result = OfferService.reject_offer(offer_message, user)
          
          expect(result).to be_failure
          expect(result.errors).to include('這個出價無法被拒絕')
          expect(result.status).to eq(:unprocessable_entity)
        end
      end
    end

    context 'when an error occurs during processing' do
      before do
        allow(offer_message).to receive(:reject_offer!).and_raise(StandardError, 'Database error')
      end

      it 'returns failure result' do
        result = OfferService.reject_offer(offer_message, user)
        
        expect(result).to be_failure
        expect(result.errors).to include('拒絕出價時發生錯誤: Database error')
        expect(result.status).to eq(:internal_server_error)
      end

      it 'logs the error' do
        expect(Rails.logger).to receive(:error).with('拒絕出價時發生錯誤: Database error')
        expect(Rails.logger).to receive(:error).with(kind_of(String)) # backtrace
        
        OfferService.reject_offer(offer_message, user)
      end
    end
  end

  describe 'private methods' do
    let!(:offer_message) do
      create(:message, :offer,
             sender: other_user,
             recipient: user,
             bicycle: bicycle,
             offer_amount: 15000)
    end

    describe 'validate_offer_action' do
      it 'validates message existence' do
        result = OfferService.send(:validate_offer_action, nil, user, 'accept')
        
        expect(result).to be_failure
        expect(result.errors).to include('出價訊息不存在')
      end

      it 'validates sender existence' do
        allow(offer_message).to receive(:sender).and_return(nil)
        result = OfferService.send(:validate_offer_action, offer_message, user, 'accept')
        
        expect(result).to be_failure
        expect(result.errors).to include('出價發送者不存在')
      end

      it 'validates user permissions' do
        wrong_user = create(:user)
        result = OfferService.send(:validate_offer_action, offer_message, wrong_user, 'accept')
        
        expect(result).to be_failure
        expect(result.errors).to include('您沒有權限接受這個出價')
      end

      it 'validates bicycle availability for accept action' do
        bicycle.update!(status: 'sold')
        result = OfferService.send(:validate_offer_action, offer_message, user, 'accept')
        
        expect(result).to be_failure
        expect(result.errors).to include('腳踏車已不可購買')
      end

      it 'does not validate bicycle availability for reject action' do
        bicycle.update!(status: 'sold')
        result = OfferService.send(:validate_offer_action, offer_message, user, 'reject')
        
        expect(result).to be_success
      end
    end

    describe 'create_order' do
      it 'creates order with correct attributes' do
        order = OfferService.send(:create_order, offer_message)
        
        expect(order.user).to eq(other_user)
        expect(order.bicycle).to eq(bicycle)
        expect(order.total_price).to eq(15000)
        expect(order.status).to eq('pending')
        expect(order.payment_status).to eq('pending')
      end
    end

    describe 'build_acceptance_message_content' do
      let(:order) { build(:order, order_number: 'ORD-20241201-ABC123') }

      it 'builds correct acceptance message content' do
        content = OfferService.send(:build_acceptance_message_content, offer_message, order)
        
        expect(content).to include('我接受了您的出價 NT$15,000！')
        expect(content).to include('您的訂單編號是 ORD-20241201-ABC123。')
        expect(content).to include('請聯繫我完成交易。')
      end
    end
  end

  describe 'OfferService::Result' do
    it 'uses the same Result class as MessageService' do
      expect(OfferService::Result).to eq(MessageService::Result)
    end
  end
end 