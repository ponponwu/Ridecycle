class BicycleSerializer
  include JSONAPI::Serializer
  attributes :id, :title, :description, :model, :year, :frame_size, :bicycle_type, :condition, :location, :contact_method, :status, :created_at, :updated_at # 加入您需要的其他屬性
  
  # 價格屬性，確保返回數字型別
  attribute :price do |object|
    object.price.to_f
  end

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

  # 主圖 WebP URL (通常用於詳情頁) - 只在需要時生成
  attribute :main_webp_urls do |object, params|
    # 只有在詳細視圖時才生成所有變體，否則為空陣列以節省資源
    if params && params[:detailed_view]
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
    else
      []
    end
  end

  # 縮圖 WebP URL (通常用於列表頁) - 智能生成策略
  attribute :thumbnail_webp_urls do |object, params|
    # 對於列表頁面，只生成第一張圖片的縮圖以優化性能
    if object.photos.attached? && object.photos.first.present?
      # 檢查是否已有預載的變體（詳細頁面），如果有就使用
      if object.photos.first.variant_records.loaded? && object.photos.first.variant_records.any?
        # 使用預載的變體中的縮圖變體
        thumbnail_variant = object.photos.first.variant_records.find { |vr| vr.variation_digest&.include?('resize_to_fill') }
        if thumbnail_variant
          begin
            url = Rails.application.routes.url_helpers.rails_representation_url(thumbnail_variant, only_path: false)
            return [url]
          rescue StandardError => e
            Rails.logger.error "BicycleSerializer: Error using preloaded variant: #{e.message}"
          end
        end
      end
      
      # 沒有預載變體時，按需生成（列表頁面）
      variant = object.thumbnail_webp_photo_variant(0)
      if variant
        begin
          url = Rails.application.routes.url_helpers.rails_representation_url(variant, only_path: false)
          [url]
        rescue NoMethodError
          Rails.logger.error "BicycleSerializer: Failed to generate thumbnail_webp_urls. Ensure default_url_options[:host] is set."
          []
        rescue StandardError => e
          Rails.logger.error "BicycleSerializer: Error generating thumbnail_webp_urls for variant: #{e.message}"
          []
        end
      else
        []
      end
    else
      []
    end
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

  # 添加 user_id 屬性
  attribute :user_id do |object|
    object.user_id
  end

  # 統一的品牌資訊 - 內嵌完整資料
  attribute :brand do |object|
    if object.brand
      {
        id: object.brand.id,
        name: object.brand.name,
        created_at: object.brand.created_at,
        updated_at: object.brand.updated_at
      }
    end
  end

  # 統一的型號資訊 - 內嵌完整資料
  attribute :bicycle_model do |object|
    if object.bicycle_model
      {
        id: object.bicycle_model.id,
        name: object.bicycle_model.name,
        year: object.bicycle_model.year,
        original_msrp: object.bicycle_model.original_msrp&.to_f
      }
    end
  end

  # 統一的賣家資訊 - 內嵌完整資料
  attribute :seller do |object|
    if object.user
      {
        id: object.user.id,
        name: object.user.name,
        full_name: object.user.full_name,
        email: object.user.email,
        avatar_url: object.user.avatar_url,
        created_at: object.user.created_at,
        updated_at: object.user.updated_at
      }
    end
  end

  # 與此自行車相關的訊息 (可以選擇是否包含，可能需要根據授權和參數控制)
  has_many :messages do |object, params|
    # 檢查目前用戶是否是賣家或特定買家
    current_user = params[:current_user]
    if current_user
      # 如果是賣家或有查看全部訊息的權限
      if current_user.id == object.user_id || params[:include_all_messages]
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

  # 統一的變速系統資訊
  attribute :transmission do |object|
    if object.transmission
      {
        id: object.transmission.id,
        name: object.transmission.name
      }
    end
  end

  # 主圖 WebP URL (通常用於詳情頁)
  attribute :main_webp_photo_url do |object|
    variant = object.main_webp_photo_variant
    if variant
      begin
        Rails.application.routes.url_helpers.rails_representation_url(variant, only_path: false)
      rescue NoMethodError
        Rails.logger.error "BicycleSerializer: Failed to generate main_webp_photo_url. Ensure default_url_options[:host] is set."
        nil
      rescue StandardError => e
        Rails.logger.error "BicycleSerializer: Error generating main_webp_photo_url for Bicycle ##{object.id}: #{e.message}"
        nil
      end
    end
  end

  # 縮圖 WebP URL (通常用於列表頁)
  attribute :thumbnail_webp_photo_url do |object|
    variant = object.thumbnail_webp_photo_variant
    if variant
      begin
        Rails.application.routes.url_helpers.rails_representation_url(variant, only_path: false)
      rescue NoMethodError
        Rails.logger.error "BicycleSerializer: Failed to generate thumbnail_webp_photo_url. Ensure default_url_options[:host] is set."
        nil
      rescue StandardError => e
        Rails.logger.error "BicycleSerializer: Error generating thumbnail_webp_photo_url for Bicycle ##{object.id}: #{e.message}"
        nil
      end
    end
  end

  # 顯示名稱
  attribute :full_display_name do |object|
    object.full_display_name
  end

  # 格式化的價格
  attribute :display_price do |object|
    object.display_price
  end

  # 是否可用
  attribute :available do |object|
    object.available?
  end

  # 格式化的年份 (確保是字串)
  attribute :year do |object|
    object.year&.to_s
  end

  # 格式化的尺寸 (統一大寫顯示)
  attribute :frame_size do |object|
    object.frame_size&.upcase
  end

  # 變速系統名稱 (便利方法)
  attribute :transmission_name do |object|
    object.transmission&.name
  end

  # 品牌名稱 (便利方法)
  attribute :brand_name do |object|
    object.brand&.name
  end

  # 型號名稱 (便利方法)
  attribute :model_name do |object|
    object.bicycle_model&.name || object.model
  end

  # 原價 (來自型號資訊)
  attribute :original_price do |object|
    object.bicycle_model&.original_msrp&.to_f
  end
end 