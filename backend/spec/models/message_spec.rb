require 'rails_helper'

RSpec.describe Message, type: :model do
  let(:sender) { create(:user, name: 'Alice') }
  let(:recipient) { create(:user, name: 'Bob') }
  let(:bicycle) { create(:bicycle, user: recipient) }

  describe 'associations' do
    it { should belong_to(:sender).class_name('User') }
    it { should belong_to(:recipient).class_name('User') }
    it { should belong_to(:bicycle) }
  end

  describe 'validations' do
    subject { build(:message, sender: sender, recipient: recipient, bicycle: bicycle) }

    it { should validate_presence_of(:content) }
    it { should validate_presence_of(:sender_id) }
    it { should validate_presence_of(:recipient_id) }
    it { should validate_presence_of(:bicycle_id) }

    context 'when is_offer is true' do
      subject { build(:message, :offer, sender: sender, recipient: recipient, bicycle: bicycle) }

      it { should validate_presence_of(:offer_amount) }
      it { should validate_numericality_of(:offer_amount).is_greater_than(0) }
      
      it 'validates offer_status inclusion' do
        valid_statuses = [:pending, :accepted, :rejected, :expired]
        valid_statuses.each do |status|
          subject.offer_status = status
          expect(subject).to be_valid
        end
        
        expect {
          subject.offer_status = 'invalid_status'
        }.to raise_error(ArgumentError, "'invalid_status' is not a valid offer_status")
      end
    end

    context 'when is_offer is false' do
      subject { build(:message, sender: sender, recipient: recipient, bicycle: bicycle, is_offer: false) }

      it 'should not allow offer_amount' do
        subject.offer_amount = 1000
        expect(subject).not_to be_valid
        expect(subject.errors[:offer_amount]).to include('must be blank')
      end
    end
  end

  describe 'enums' do
    it 'defines offer_status enum correctly' do
      expect(Message.offer_statuses).to eq({
        'pending' => 0,
        'accepted' => 1,
        'rejected' => 2,
        'expired' => 3
      })
    end

    it 'provides prefix methods' do
      message = build(:message, :offer, offer_status: :pending)
      expect(message).to be_offer_pending
      expect(message).not_to be_offer_accepted
    end
  end

  describe 'scopes' do
    let!(:regular_message) { create(:message, sender: sender, recipient: recipient, bicycle: bicycle) }
    let!(:offer_message) { create(:message, :offer, sender: sender, recipient: recipient, bicycle: bicycle) }
    let!(:accepted_offer) { create(:message, :offer, :accepted, sender: sender, recipient: recipient, bicycle: bicycle) }

    describe '.offers' do
      it 'returns only offer messages' do
        expect(Message.offers).to include(offer_message, accepted_offer)
        expect(Message.offers).not_to include(regular_message)
      end
    end

    describe '.regular_messages' do
      it 'returns only non-offer messages' do
        expect(Message.regular_messages).to include(regular_message)
        expect(Message.regular_messages).not_to include(offer_message, accepted_offer)
      end
    end

    describe '.pending_offers' do
      it 'returns only pending offers' do
        expect(Message.pending_offers).to include(offer_message)
        expect(Message.pending_offers).not_to include(accepted_offer, regular_message)
      end
    end

    describe '.active_offers' do
      it 'returns pending and accepted offers' do
        expect(Message.active_offers).to include(offer_message, accepted_offer)
        expect(Message.active_offers).not_to include(regular_message)
      end
    end
  end

  describe 'instance methods' do
    describe '#offer?' do
      it 'returns true for offer messages' do
        message = build(:message, :offer)
        expect(message.offer?).to be true
      end

      it 'returns false for regular messages' do
        message = build(:message)
        expect(message.offer?).to be false
      end
    end

    describe '#offer_active?' do
      it 'returns true for pending offers' do
        message = build(:message, :offer, offer_status: :pending)
        expect(message.offer_active?).to be true
      end

      it 'returns false for accepted offers' do
        message = build(:message, :offer, offer_status: :accepted)
        expect(message.offer_active?).to be false
      end

      it 'returns false for regular messages' do
        message = build(:message)
        expect(message.offer_active?).to be false
      end
    end

    describe '#formatted_offer_amount' do
      it 'formats offer amount correctly' do
        message = build(:message, :offer, offer_amount: 12345)
        expect(message.formatted_offer_amount).to eq('NT$12,345')
      end

      it 'returns nil for non-offer messages' do
        message = build(:message)
        expect(message.formatted_offer_amount).to be_nil
      end

      it 'returns nil when offer_amount is nil' do
        message = build(:message, :offer, offer_amount: nil)
        expect(message.formatted_offer_amount).to be_nil
      end
    end

    describe '#offer_status_text' do
      it 'returns correct Chinese text for each status' do
        expect(build(:message, :offer, offer_status: :pending).offer_status_text).to eq('待回應')
        expect(build(:message, :offer, offer_status: :accepted).offer_status_text).to eq('已接受')
        expect(build(:message, :offer, offer_status: :rejected).offer_status_text).to eq('已拒絕')
        expect(build(:message, :offer, offer_status: :expired).offer_status_text).to eq('已過期')
      end

      it 'returns nil for non-offer messages' do
        message = build(:message)
        expect(message.offer_status_text).to be_nil
      end
    end

    describe '#accept_offer!' do
      let!(:offer1) { create(:message, :offer, sender: sender, recipient: recipient, bicycle: bicycle, offer_amount: 1000) }
      let!(:offer2) { create(:message, :offer, sender: create(:user), recipient: recipient, bicycle: bicycle, offer_amount: 1200) }

      it 'accepts the offer and rejects other pending offers' do
        expect(offer1.accept_offer!).to be true
        
        offer1.reload
        offer2.reload
        
        expect(offer1.offer_status).to eq('accepted')
        expect(offer2.offer_status).to eq('rejected')
      end

      it 'returns false for non-offer messages' do
        regular_message = create(:message, sender: sender, recipient: recipient, bicycle: bicycle)
        expect(regular_message.accept_offer!).to be false
      end

      it 'returns false for already accepted offers' do
        offer1.update!(offer_status: :accepted)
        expect(offer1.accept_offer!).to be false
      end
    end

    describe '#reject_offer!' do
      let(:offer) { create(:message, :offer, sender: sender, recipient: recipient, bicycle: bicycle) }

      it 'rejects the offer' do
        expect(offer.reject_offer!).to be true
        expect(offer.reload.offer_status).to eq('rejected')
      end

      it 'returns false for non-offer messages' do
        regular_message = create(:message, sender: sender, recipient: recipient, bicycle: bicycle)
        expect(regular_message.reject_offer!).to be false
      end

      it 'returns false for already rejected offers' do
        offer.update!(offer_status: :rejected)
        expect(offer.reject_offer!).to be false
      end
    end
  end

  describe 'class methods' do
    describe '.has_pending_offer?' do
      let!(:pending_offer) { create(:message, :offer, sender: sender, recipient: recipient, bicycle: bicycle) }
      let!(:accepted_offer) { create(:message, :offer, :accepted, sender: sender, recipient: recipient, bicycle: bicycle) }

      it 'returns true when there is a pending offer' do
        expect(Message.has_pending_offer?(sender.id, recipient.id, bicycle.id)).to be true
      end

      it 'returns false when there is no pending offer' do
        pending_offer.update!(offer_status: :accepted)
        expect(Message.has_pending_offer?(sender.id, recipient.id, bicycle.id)).to be false
      end

      it 'returns false for different users or bicycles' do
        other_user = create(:user)
        other_bicycle = create(:bicycle)
        
        expect(Message.has_pending_offer?(other_user.id, recipient.id, bicycle.id)).to be false
        expect(Message.has_pending_offer?(sender.id, other_user.id, bicycle.id)).to be false
        expect(Message.has_pending_offer?(sender.id, recipient.id, other_bicycle.id)).to be false
      end
    end

    describe '.latest_offer_for' do
      let!(:old_offer) { create(:message, :offer, sender: sender, recipient: recipient, bicycle: bicycle, created_at: 1.day.ago) }
      let!(:new_offer) { create(:message, :offer, sender: sender, recipient: recipient, bicycle: bicycle, created_at: 1.hour.ago) }

      it 'returns the most recent offer' do
        expect(Message.latest_offer_for(sender.id, recipient.id, bicycle.id)).to eq(new_offer)
      end

      it 'returns nil when no offers exist' do
        other_user = create(:user)
        expect(Message.latest_offer_for(other_user.id, recipient.id, bicycle.id)).to be_nil
      end
    end
  end
end 