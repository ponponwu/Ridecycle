require 'rails_helper'

RSpec.describe 'Bicycle Status Workflow', type: :model do
  let(:seller) { create(:user) }
  let(:buyer) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:bicycle) { create(:bicycle, user: seller, status: :pending) }

  describe 'Complete bicycle status workflow' do
    it 'follows the correct status progression: pending → available → reserved → sold' do
      # 1. Bicycle starts as pending after upload
      expect(bicycle.status).to eq('pending')
      expect(bicycle.pending?).to be true

      # 2. Admin approves bicycle → available
      bicycle.update!(status: :available)
      expect(bicycle.status).to eq('available')
      expect(bicycle.available?).to be true

      # 3. Buyer creates order → bicycle becomes reserved
      order = create(:order, user: buyer, bicycle: bicycle)
      bicycle.reload
      expect(bicycle.status).to eq('reserved')
      expect(bicycle.reserved?).to be true
      expect(order.status).to eq('processing')

      # 4. Buyer makes payment
      order.payment.update!(status: :paid)
      bicycle.reload
      # Bicycle should still be reserved (not automatically sold)
      expect(bicycle.status).to eq('reserved')

      # 5. Admin approves sale → bicycle becomes sold
      result = order.admin_approve_sale!
      expect(result).to be true
      bicycle.reload
      order.reload
      expect(bicycle.status).to eq('sold')
      expect(bicycle.sold?).to be true
      expect(order.status).to eq('completed')
    end

    it 'handles order cancellation correctly' do
      # Setup: bicycle is reserved through order
      bicycle.update!(status: :available)
      order = create(:order, user: buyer, bicycle: bicycle)
      bicycle.reload
      expect(bicycle.status).to eq('reserved')

      # Cancel order → bicycle becomes available again
      order.update!(status: :cancelled)
      bicycle.reload
      expect(bicycle.status).to eq('available')
      expect(bicycle.available?).to be true
    end

    it 'handles admin rejection after payment' do
      # Setup: bicycle is reserved and payment is made
      bicycle.update!(status: :available)
      order = create(:order, user: buyer, bicycle: bicycle)
      order.payment.update!(status: :paid)
      bicycle.reload
      expect(bicycle.status).to eq('reserved')

      # Admin rejects sale
      Order.transaction do
        order.update!(status: :cancelled)
        bicycle.update!(status: :available)
        order.payment.update!(status: :refunded)
      end

      bicycle.reload
      order.reload
      expect(bicycle.status).to eq('available')
      expect(order.status).to eq('cancelled')
      expect(order.payment.status).to eq('refunded')
    end
  end

  describe 'Status validation in order creation' do
    it 'allows order creation only for available bicycles' do
      # Test with available bicycle
      bicycle.update!(status: :available)
      expect {
        create(:order, user: buyer, bicycle: bicycle)
      }.not_to raise_error

      # Test with reserved bicycle
      another_bicycle = create(:bicycle, user: seller, status: :reserved)
      expect {
        create(:order, user: buyer, bicycle: another_bicycle)
      }.to raise_error(ActiveRecord::RecordInvalid)

      # Test with sold bicycle
      sold_bicycle = create(:bicycle, user: seller, status: :sold)
      expect {
        create(:order, user: buyer, bicycle: sold_bicycle)
      }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end

  describe 'Search filtering' do
    it 'only shows available bicycles in search results' do
      # Create bicycles in different statuses
      pending_bike = create(:bicycle, user: seller, status: :pending)
      available_bike = create(:bicycle, user: seller, status: :available)
      reserved_bike = create(:bicycle, user: seller, status: :reserved)
      sold_bike = create(:bicycle, user: seller, status: :sold)

      # Search should only return available bicycles
      search_results = BicycleSearchService.new({}).call
      bicycle_ids = search_results[:bicycles].pluck(:id)

      expect(bicycle_ids).to include(available_bike.id)
      expect(bicycle_ids).not_to include(pending_bike.id)
      expect(bicycle_ids).not_to include(reserved_bike.id)
      expect(bicycle_ids).not_to include(sold_bike.id)
    end
  end

  describe 'Admin approval workflow' do
    it 'only allows admin approval for paid orders with reserved bicycles' do
      bicycle.update!(status: :available)
      order = create(:order, user: buyer, bicycle: bicycle)
      
      # Cannot approve without payment
      expect(order.can_be_approved_by_admin?).to be false
      
      # After payment, can approve
      order.payment.update!(status: :paid)
      expect(order.can_be_approved_by_admin?).to be true
      
      # After approval, cannot approve again
      order.admin_approve_sale!
      order.reload
      expect(order.can_be_approved_by_admin?).to be false
    end
  end
end