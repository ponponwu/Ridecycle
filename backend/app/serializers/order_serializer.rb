class OrderSerializer
  include JSONAPI::Serializer
  
  attributes :id, :order_number, :total_price, :status, :payment_status, :created_at, :updated_at
  
  # 訂單相關的買家
  belongs_to :user
  
  # 訂單相關的自行車
  belongs_to :bicycle
  
  # 如果儲存了 shipping_address
  attribute :shipping_address do |object|
    object.shipping_address if object.respond_to?(:shipping_address) && object.shipping_address.present?
  end
  
  # 付款詳情 (可能需要過濾敏感資料)
  attribute :payment_details do |object|
    if object.respond_to?(:payment_details) && object.payment_details.present?
      # 返回過濾後的付款詳情，移除敏感資訊
      filtered_details = object.payment_details.except('card_number', 'cvv', 'full_card_number')
      
      # 如果存在卡號，僅保留最後 4 位
      if object.payment_details['card_number'].present?
        filtered_details['card_last_four'] = object.payment_details['card_number'][-4..-1]
      end
      
      filtered_details
    end
  end
  
  # 其他訂單相關資訊
  attribute :estimated_delivery_date do |object|
    object.estimated_delivery_date if object.respond_to?(:estimated_delivery_date)
  end
  
  attribute :tracking_number do |object|
    object.tracking_number if object.respond_to?(:tracking_number)
  end
end 