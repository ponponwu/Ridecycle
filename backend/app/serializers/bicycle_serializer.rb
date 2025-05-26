class BicycleSerializer
  include JSONAPI::Serializer
  attributes :id, :title, :description, :price, :model, :year, :frame_size, :bicycle_type, :condition, :location, :contact_method, :status, :created_at, :updated_at # 加入您需要的其他屬性

  # 為了能正確生成 URL，請確保在 config/environments/*.rb 中設定了 default_url_options
  # 例如，在 config/environments/production.rb 中:
  #   config.action_mailer.default_url_options = { host: ENV.fetch('APPLICATION_HOST', 'your-backend-domain.railway.app'), protocol: 'https' }
  #   Rails.application.routes.default_url_options = { host: ENV.fetch('APPLICATION_HOST', 'your-backend-domain.railway.app'), protocol: 'https' }
  # 並在 Railway 環境變數中設定 APPLICATION_HOST

  attribute :photos_urls do |object|
    if object.photos.attached?
      object.photos.map do |photo|
        begin
          Rails.application.routes.url_helpers.rails_blob_url(photo, only_path: false)
        rescue NoMethodError # 通常是因為 default_url_options[:host] 未設定
          Rails.logger.error "BicycleSerializer: Failed to generate photos_urls. Ensure default_url_options[:host] is set."
          nil
        rescue StandardError => e
          Rails.logger.error "BicycleSerializer: Error generating photos_urls for photo ##{photo.id}: #{e.message}"
          nil
        end
      end.compact
    else
      []
    end
  end

  # 主圖 WebP URL (通常用於詳情頁)
  attribute :main_webp_urls do |object|
    object.all_main_webp_photo_variants.map do |variant|
      begin
        Rails.application.routes.url_helpers.rails_representation_url(variant, only_path: false)
      rescue NoMethodError
        Rails.logger.error "BicycleSerializer: Failed to generate main_webp_urls. Ensure default_url_options[:host] is set."
        nil
      rescue StandardError => e
        Rails.logger.error "BicycleSerializer: Error generating main_webp_urls for variant: #{e.message}"
        nil
      end
    end.compact
  end

  # 縮圖 WebP URL (通常用於列表頁)
  attribute :thumbnail_webp_urls do |object|
    object.all_thumbnail_webp_photo_variants.map do |variant|
      begin
        Rails.application.routes.url_helpers.rails_representation_url(variant, only_path: false)
      rescue NoMethodError
        Rails.logger.error "BicycleSerializer: Failed to generate thumbnail_webp_urls. Ensure default_url_options[:host] is set."
        nil
      rescue StandardError => e
        Rails.logger.error "BicycleSerializer: Error generating thumbnail_webp_urls for variant: #{e.message}"
        nil
      end
    end.compact
  end

  # 單獨提供第一張圖片的各種版本，方便前端直接使用
  attribute :main_photo_original_url do |object|
    if object.photos.attached? && object.photos.first.present?
      begin
        Rails.application.routes.url_helpers.rails_blob_url(object.photos.first, only_path: false)
      rescue NoMethodError
        Rails.logger.error "BicycleSerializer: Failed to generate main_photo_original_url. Ensure default_url_options[:host] is set."
        nil
      rescue StandardError => e
        Rails.logger.error "BicycleSerializer: Error generating main_photo_original_url: #{e.message}"
        nil
      end
    end
  end

  attribute :main_photo_webp_url do |object|
    main_variant = object.main_webp_photo_variant(0)
    if main_variant
      begin
        Rails.application.routes.url_helpers.rails_representation_url(main_variant, only_path: false)
      rescue NoMethodError
        Rails.logger.error "BicycleSerializer: Failed to generate main_photo_webp_url. Ensure default_url_options[:host] is set."
        nil
      rescue StandardError => e
        Rails.logger.error "BicycleSerializer: Error generating main_photo_webp_url: #{e.message}"
        nil
      end
    end
  end

  attribute :main_photo_thumbnail_webp_url do |object|
    thumbnail_variant = object.thumbnail_webp_photo_variant(0)
    if thumbnail_variant
      begin
        Rails.application.routes.url_helpers.rails_representation_url(thumbnail_variant, only_path: false)
      rescue NoMethodError
        Rails.logger.error "BicycleSerializer: Failed to generate main_photo_thumbnail_webp_url. Ensure default_url_options[:host] is set."
        nil
      rescue StandardError => e
        Rails.logger.error "BicycleSerializer: Error generating main_photo_thumbnail_webp_url: #{e.message}"
        nil
      end
    end
  end

  belongs_to :brand, optional: true
  belongs_to :bicycle_model, optional: true
  # 賣家關聯
  belongs_to :seller, serializer: :user do |object|
    object.seller if object.respond_to?(:seller)
  end

  # 產生品牌名稱屬性，即使品牌 ID 為空
  attribute :brand_name do |object|
    object.brand&.name
  end
  
  # 產生型號名稱屬性，即使型號 ID 為空
  attribute :model_name do |object|
    object.bicycle_model&.name
  end

  # 保留舊的 seller_info 屬性以向後兼容
  attribute :seller_info do |object|
    if object.seller
      {
        id: object.seller.id,
        name: object.seller.name,
        # profile_image_url: object.seller.profile_image_url # 假設 User model 有此方法
      }
    end
  end

  # 與此自行車相關的訊息 (可以選擇是否包含，可能需要根據授權和參數控制)
  has_many :messages do |object, params|
    # 檢查目前用戶是否是賣家或特定買家
    current_user = params[:current_user]
    if current_user
      # 如果是賣家或有查看全部訊息的權限
      if current_user.id == object.seller_id || params[:include_all_messages]
        object.messages.order(created_at: :desc).limit(20)
      else
        # 只顯示當前用戶與賣家之間的通訊
        object.messages.where(sender_id: current_user.id).or(
          object.messages.where(recipient_id: current_user.id)
        ).order(created_at: :desc).limit(20)
      end
    else
      # 未登入用戶不返回訊息
      []
    end
  end
end 