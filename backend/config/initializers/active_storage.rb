# frozen_string_literal: true

# Active Storage Configuration for Rails 7
# Enhanced performance and functionality settings

Rails.application.configure do
  # Rails 7 Active Storage optimizations
  
  # Use image_processing for variants (already in Gemfile)
  config.active_storage.variant_processor = :image_processing
  
  # Enable optimized image serving
  config.active_storage.resolve_model_to_route = :rails_storage_proxy
  
  # Set reasonable defaults for URL expiration
  config.active_storage.urls_expire_in = 5.minutes
  
  # Enable precomputed variants for better performance
  config.active_storage.precompute_variant_sources = true if Rails.env.production?
  
  # Configure content types that should be served inline
  config.active_storage.content_types_allowed_inline = %w[
    image/png image/gif image/jpg image/jpeg image/webp image/avif
    application/pdf
  ]
  
  # Configure content types that should not be served inline (for security)
  config.active_storage.content_types_to_serve_as_binary = %w[
    text/html text/javascript application/javascript
    text/xml application/xml
  ]
end

# Custom Active Storage helpers for the application
module ActiveStorageHelpers
  extend ActiveSupport::Concern
  
  # Predefined image variants for consistent sizing
  BICYCLE_IMAGE_VARIANTS = {
    thumbnail: { resize_to_limit: [300, 300] },
    medium: { resize_to_limit: [600, 450] },
    large: { resize_to_limit: [1200, 900] },
    # WebP variants for modern browsers (Rails 7 feature)
    thumbnail_webp: { resize_to_limit: [300, 300], format: :webp },
    medium_webp: { resize_to_limit: [600, 450], format: :webp },
    large_webp: { resize_to_limit: [1200, 900], format: :webp }
  }.freeze
  
  class_methods do
    # Helper method to generate variants efficiently
    def generate_image_variants(attachment, sizes: [:thumbnail, :medium])
      variants = {}
      sizes.each do |size|
        if BICYCLE_IMAGE_VARIANTS[size]
          variants[size] = attachment.variant(BICYCLE_IMAGE_VARIANTS[size])
        end
      end
      variants
    end
  end
end

# Add methods to models that use Active Storage
if defined?(ActiveStorage::Attachment)
  # Monitor attachment performance
  ActiveSupport::Notifications.subscribe('service_upload.active_storage') do |name, start, finish, id, payload|
    duration = (finish - start) * 1000
    size = payload[:key] ? "Unknown size" : payload[:checksum]
    
    if duration > 5000 # Log uploads taking more than 5 seconds
      Rails.logger.warn "📎 Slow upload: #{duration.round(2)}ms for #{payload[:key]}"
    end
  end
  
  ActiveSupport::Notifications.subscribe('service_download.active_storage') do |name, start, finish, id, payload|
    duration = (finish - start) * 1000
    
    if duration > 2000 # Log downloads taking more than 2 seconds
      Rails.logger.warn "📥 Slow download: #{duration.round(2)}ms for #{payload[:key]}"
    end
  end
end

# Performance monitoring for Active Storage operations
Rails.logger.info "📎 Active Storage optimizations loaded for #{Rails.env} environment"