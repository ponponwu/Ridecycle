class UserSerializer
  include JSONAPI::Serializer
  
  attributes :id, :name, :email, :admin, :created_at, :updated_at

  # 添加 full_name 屬性，與前端期望的介面一致
  attribute :full_name do |object|
    object.name
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

  # 用戶的自行車列表關聯
  has_many :bicycles do |object, params|
    # 可以限制列表，避免返回過多資料
    # 例如：object.bicycles.limit(10)
    object.bicycles.where(status: 'available')
  end
  
  # 訊息關聯 (可選)
  # has_many :sent_messages
  # has_many :received_messages
end 