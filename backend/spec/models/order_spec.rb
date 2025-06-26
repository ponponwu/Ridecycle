# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Order, type: :model do
  let(:seller) { create(:user, :with_bank_account) }
  let(:buyer) { create(:user) }
  let(:bicycle) { create(:bicycle, user: seller, status: :available, price: 15000) }
  
  describe 'associations' do
    it { should belong_to(:user) }
    it { should belong_to(:bicycle) }
  end

  describe 'validations' do
    subject { build(:order, user: buyer, bicycle: bicycle) }
    
    # it { should validate_presence_of(:order_number) } # Order number is auto-generated
    it { should validate_uniqueness_of(:order_number) }
    it { should validate_presence_of(:total_price) }
    it { should validate_numericality_of(:total_price).is_greater_than_or_equal_to(0) }
    it { should validate_presence_of(:user_id) }
    it { should validate_presence_of(:bicycle_id) }
    it { should validate_presence_of(:shipping_method) }
    it { should validate_presence_of(:payment_method) }
    
    context '當選擇協助運送時' do
      subject { build(:order, user: buyer, bicycle: bicycle, shipping_method: :assisted_delivery) }
      
      it { should validate_presence_of(:shipping_distance) }
      it { should validate_numericality_of(:shipping_distance).is_greater_than(0) }
    end
    
    context '當選擇自行運送時' do
      subject { build(:order, user: buyer, bicycle: bicycle, shipping_method: :self_pickup) }
      
      it { should_not validate_presence_of(:shipping_distance) }
    end
  end

  describe 'enums' do
    it { should define_enum_for(:status).with_values(pending: 0, processing: 1, shipped: 2, delivered: 3, completed: 4, cancelled: 5, refunded: 6).with_prefix }
    it { should define_enum_for(:payment_status).with_values(pending: 0, awaiting_confirmation: 1, paid: 2, failed: 3, refunded: 4).with_prefix }
    it { should define_enum_for(:shipping_method).with_values(self_pickup: 0, assisted_delivery: 1).with_prefix }
    it { should define_enum_for(:payment_method).with_values(bank_transfer: 0).with_prefix }
  end

  describe 'callbacks' do
    describe 'before_validation' do
      it '在創建時生成訂單編號' do
        order = build(:order, user: buyer, bicycle: bicycle)
        order.order_number = nil  # Clear the factory-generated order number
        order.save!
        expect(order.order_number).to be_present
        expect(order.order_number).to match(/\AR-\d{6}-\w{6}\z/)
      end
      
      it '在創建時計算運費' do
        order = build(:order, user: buyer, bicycle: bicycle, shipping_method: :assisted_delivery, shipping_distance: 10)
        order.valid?
        expect(order.shipping_cost).to be > 0
      end
      
      it '在創建時設定付款說明' do
        order = build(:order, user: buyer, bicycle: bicycle)
        order.save!
        expect(order.payment_instructions).to be_present
        expect(order.company_account_info).to include(order.order_number)
      end

      it '在創建時設定付款期限' do
        order = build(:order, user: buyer, bicycle: bicycle, payment_deadline: nil)
        order.valid?
        expect(order.payment_deadline).to be_present
        expect(order.expires_at).to eq(order.payment_deadline)
        expect(order.payment_deadline).to be > 2.days.from_now
        expect(order.payment_deadline).to be < 4.days.from_now
      end
    end
  end

  describe '#calculate_shipping_cost_amount' do
    context '當選擇自行運送時' do
      let(:order) { build(:order, shipping_method: :self_pickup) }
      
      it '回傳 0' do
        expect(order.calculate_shipping_cost_amount).to eq(0)
      end
    end
    
    context '當選擇協助運送時' do
      let(:order) { build(:order, shipping_method: :assisted_delivery, shipping_distance: 5) }
      
      it '計算正確的運費' do
        expected_cost = 100 + (5 * 10) # 基本費用 + 距離費用
        expect(order.calculate_shipping_cost_amount).to eq(expected_cost)
      end
    end
  end

  describe '#calculate_delivery_cost' do
    let(:order) { build(:order, shipping_distance: 8) }
    
    it '根據距離計算配送費用' do
      expected_cost = 100 + (8 * 10) # 基本運費 + 每公里費用
      expect(order.calculate_delivery_cost).to eq(expected_cost)
    end
    
    context '當沒有距離資訊時' do
      let(:order) { build(:order, shipping_distance: nil) }
      
      it '回傳 0' do
        expect(order.calculate_delivery_cost).to eq(0)
      end
    end
  end

  describe '#can_complete?' do
    context '當訂單已付款且已送達時' do
      let(:order) { create(:order, payment_status: :paid, status: :delivered) }
      
      it '回傳 true' do
        expect(order.can_complete?).to be true
      end
    end
    
    context '當訂單已付款且已出貨時' do
      let(:order) { create(:order, payment_status: :paid, status: :shipped) }
      
      it '回傳 true' do
        expect(order.can_complete?).to be true
      end
    end
    
    context '當訂單未付款時' do
      let(:order) { create(:order, payment_status: :pending, status: :delivered) }
      
      it '回傳 false' do
        expect(order.can_complete?).to be false
      end
    end
    
    context '當訂單未送達時' do
      let(:order) { create(:order, payment_status: :paid, status: :processing) }
      
      it '回傳 false' do
        expect(order.can_complete?).to be false
      end
    end
  end

  describe '#seller' do
    let(:order) { create(:order, user: buyer, bicycle: bicycle) }
    
    it '回傳自行車的擁有者' do
      expect(order.seller).to eq(seller)
    end
  end

  describe '#buyer' do
    let(:order) { create(:order, user: buyer, bicycle: bicycle) }
    
    it '回傳訂單的使用者' do
      expect(order.buyer).to eq(buyer)
    end
  end

  describe '#seller_bank_account_complete?' do
    context '當賣家有完整的銀行帳戶資訊時' do
      let(:order) { create(:order, user: buyer, bicycle: bicycle) }
      
      it '回傳 true' do
        expect(order.seller_bank_account_complete?).to be true
      end
    end
    
    context '當賣家沒有完整的銀行帳戶資訊時' do
      let(:seller_without_bank) { create(:user) }
      let(:bicycle_without_bank) { create(:bicycle, user: seller_without_bank) }
      let(:order) { create(:order, user: buyer, bicycle: bicycle_without_bank) }
      
      it '回傳 false' do
        expect(order.seller_bank_account_complete?).to be false
      end
    end
  end

  describe 'order number generation' do
    it '生成唯一的訂單編號' do
      order1 = create(:order, user: buyer, bicycle: bicycle)
      order2 = create(:order, user: buyer, bicycle: bicycle)
      
      expect(order1.order_number).not_to eq(order2.order_number)
      expect(order1.order_number).to match(/\AR-\d{6}-\w{6}\z/)
      expect(order2.order_number).to match(/\AR-\d{6}-\w{6}\z/)
    end

    it '生成格式正確的訂單編號' do
      order = create(:order, user: buyer, bicycle: bicycle)
      expect(order.order_number).to match(/\AR-\d{6}-\w{6}\z/)
    end
  end

  describe 'payment instructions' do
    let(:order) { create(:order, user: buyer, bicycle: bicycle, payment_method: :bank_transfer) }
    
    it '包含訂單編號' do
      expect(order.company_account_info).to include(order.order_number)
    end
    
    it '包含付款說明' do
      expect(order.payment_instructions).to be_present
    end
  end

  describe 'payment deadline methods' do
    let(:order) { create(:order, user: buyer, bicycle: bicycle) }

    describe '#expired?' do
      context '當訂單未過期時' do
        it '回傳 false' do
          expect(order.expired?).to be false
        end
      end

      context '當訂單已過期時' do
        before { order.update!(expires_at: 1.hour.ago) }
        
        it '回傳 true' do
          expect(order.expired?).to be true
        end
      end
    end

    describe '#remaining_payment_hours' do
      context '當付款期限未到時' do
        before { order.update!(payment_deadline: 2.days.from_now) }
        
        it '回傳正確的剩餘小時數' do
          expect(order.remaining_payment_hours).to be > 40
          expect(order.remaining_payment_hours).to be <= 48
        end
      end

      context '當付款期限已過時' do
        before { order.update!(payment_deadline: 1.hour.ago) }
        
        it '回傳 0' do
          expect(order.remaining_payment_hours).to eq(0)
        end
      end
    end

    describe '#remaining_payment_time_humanized' do
      context '當剩餘時間超過24小時時' do
        before { order.update!(payment_deadline: 2.days.from_now) }
        
        it '顯示天數' do
          expect(order.remaining_payment_time_humanized).to include('day')
        end
      end

      context '當剩餘時間少於24小時時' do
        before { order.update!(payment_deadline: 12.hours.from_now) }
        
        it '顯示小時數' do
          expect(order.remaining_payment_time_humanized).to include('hour')
        end
      end

      context '當付款已過期時' do
        before { order.update!(expires_at: 1.hour.ago, payment_deadline: 1.hour.ago) }
        
        it '顯示過期訊息' do
          expect(order.remaining_payment_time_humanized).to eq(I18n.t('orders.payment_expired'))
        end
      end
    end
  end

  describe 'scopes' do
    let!(:pending_order) { create(:order, user: buyer, bicycle: bicycle, status: :pending, payment_status: :pending) }
    let!(:paid_order) { create(:order, user: buyer, bicycle: bicycle, status: :pending, payment_status: :paid) }
    let!(:expired_order) { create(:order, user: buyer, bicycle: bicycle, status: :pending, payment_status: :pending, expires_at: 1.day.ago, payment_deadline: 1.day.ago) }

    describe '.pending_payment' do
      it '回傳待付款的訂單' do
        expect(Order.pending_payment).to include(pending_order, expired_order)
        expect(Order.pending_payment).not_to include(paid_order)
      end
    end

    describe '.expired' do
      it '回傳已過期的訂單' do
        expect(Order.expired).to include(expired_order)
        expect(Order.expired).not_to include(pending_order, paid_order)
      end
    end

    describe '.pending_and_expired' do
      it '回傳待付款且已過期的訂單' do
        expect(Order.pending_and_expired).to include(expired_order)
        expect(Order.pending_and_expired).not_to include(pending_order, paid_order)
      end
    end
  end

  describe '.cancel_expired_orders!' do
    let!(:expired_order1) { create(:order, user: buyer, bicycle: bicycle, status: :pending, payment_status: :pending, expires_at: 1.day.ago, payment_deadline: 1.day.ago) }
    let!(:expired_order2) { create(:order, user: buyer, bicycle: bicycle, status: :pending, payment_status: :pending, expires_at: 1.day.ago, payment_deadline: 1.day.ago) }
    let!(:valid_order) { create(:order, user: buyer, bicycle: bicycle, status: :pending, payment_status: :pending) }

    it '取消所有過期的訂單' do
      cancelled_count = Order.cancel_expired_orders!
      
      expect(cancelled_count).to eq(2)
      expect(expired_order1.reload.status).to eq('cancelled')
      expect(expired_order2.reload.status).to eq('cancelled')
      expect(valid_order.reload.status).to eq('pending')
    end
  end
end 