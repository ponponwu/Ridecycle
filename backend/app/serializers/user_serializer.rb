class UserSerializer
  include JSONAPI::Serializer
  
  attributes :id, :name, :email, :admin, :created_at, :updated_at, :is_suspicious, :is_blacklisted

  # 添加 full_name 屬性，與前端期望的介面一致
  attribute :full_name do |object|
    object.name
  end

  # 銀行帳戶完成狀態
  attribute :bank_account_complete do |object|
    object.bank_account_complete?
  end

  # 銀行帳戶資訊
  attribute :bank_account_info do |object|
    object.bank_account_info
  end

  # 不返回敏感屬性，如 password_digest, provider, uid
  
  # 如果有頭像或個人資料圖片
  attribute :profile_image_url do |object|
    if object.respond_to?(:profile_image) && object.profile_image.attached?
      begin
        Rails.application.routes.url_helpers.rails_blob_url(object.profile_image, only_path: false)
      rescue NoMethodError
        Rails.logger.error "UserSerializer: Failed to generate profile_image_url. Ensure default_url_options[:host] is set."
        nil
      rescue StandardError => e
        Rails.logger.error "UserSerializer: Error generating profile_image_url: #{e.message}"
        nil
      end
    end
  end

  # 頭像 URL，直接使用資料庫字段
  attribute :avatar_url do |object|
    object.avatar_url
  end
  
  # 管理員專用統計屬性 - 使用預載入的關聯數據
  attribute :bicycles_count do |object|
    # 使用 size 而非 count，利用預載入的關聯數據
    object.bicycles.size
  end
  
  attribute :messages_count do |object|
    # 使用 size 而非 count，利用預載入的關聯數據
    object.sent_messages.size + object.received_messages.size
  end
  
  # 用戶角色
  attribute :role do |object|
    object.admin? ? 'admin' : 'user'
  end

  # 管理員列表不需要返回完整的自行車列表關聯，避免 N+1 查詢
  # 如需要自行車資料，請使用專門的端點
  
  # 訊息關聯 (可選) - 在管理員列表中不載入以提升性能
  # has_many :sent_messages
  # has_many :received_messages
end 