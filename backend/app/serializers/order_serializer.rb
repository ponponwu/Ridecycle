class OrderSerializer
  include JSONAPI::Serializer
  
  attributes :id, :order_number, :total_price, :status, :created_at, :updated_at,
             :shipping_method, :shipping_cost, :shipping_distance

  # Payment-related attributes now come from OrderPayment
  attribute :payment_status do |object|
    object.payment&.status
  end

  attribute :payment_method do |object|
    object.payment&.method
  end

  attribute :payment_deadline do |object|
    object.payment&.deadline
  end

  attribute :expires_at do |object|
    object.payment&.expires_at
  end

  attribute :payment_instructions do |object|
    object.payment&.instructions
  end

  attribute :company_account_info do |object|
    object.payment&.company_account_info
  end
  
  # 買家資訊
  attribute :buyer do |object|
    if object.user
      {
        id: object.user.id,
        name: object.user.name,
        full_name: object.user.full_name,
        email: object.user.email,
        avatar_url: object.user.avatar_url
      }
    end
  end

  # 賣家資訊
  attribute :seller do |object|
    if object.bicycle&.user
      {
        id: object.bicycle.user.id,
        name: object.bicycle.user.name,
        full_name: object.bicycle.user.full_name,
        email: object.bicycle.user.email,
        avatar_url: object.bicycle.user.avatar_url
      }
    end
  end
  
  # 統一的自行車資訊
  attribute :bicycle do |object|
    if object.bicycle
      {
        id: object.bicycle.id,
        title: object.bicycle.title,
        price: object.bicycle.price.to_f,
        status: object.bicycle.status,
        brand: object.bicycle.brand&.name,
        model: object.bicycle.bicycle_model&.name,
        main_photo_url: object.bicycle.photos.attached? && object.bicycle.photos.first.present? ?
          Rails.application.routes.url_helpers.rails_blob_url(object.bicycle.photos.first, only_path: false) : nil
      }
    end
  end
  
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

  # 付款期限相關資訊 (now from OrderPayment)
  attribute :remaining_payment_hours do |object|
    object.payment&.remaining_payment_hours
  end

  attribute :remaining_payment_time_humanized do |object|
    object.payment&.remaining_payment_time_humanized
  end

  attribute :expired do |object|
    object.payment&.expired? || false
  end

  # 付款證明相關資訊 (now from OrderPayment)
  attribute :payment_proof_info do |object|
    payment = object.payment
    if payment&.has_payment_proof?
      latest_proof = payment.latest_payment_proof
      {
        has_proof: true,
        status: payment.payment_proof_status,
        filename: latest_proof.filename.to_s,
        uploaded_at: latest_proof.created_at.iso8601,
        file_size: latest_proof.byte_size,
        content_type: latest_proof.content_type,
        metadata: latest_proof.metadata || {}
      }
    else
      {
        has_proof: false,
        status: 'none'
      }
    end
  end
end 