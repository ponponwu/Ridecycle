# frozen_string_literal: true

# Active Record Encryption Configuration for Rails 7
# Enhanced encryption settings for sensitive data protection

Rails.application.configure do
  # Configure encryption settings based on environment
  if Rails.env.production?
    # Production encryption settings
    config.active_record.encryption.encrypt_fixtures = false
    config.active_record.encryption.store_key_references = true
    config.active_record.encryption.extend_queries = true
    
    # Configure encryption keys from credentials
    config.active_record.encryption.primary_key = Rails.application.credentials.active_record_encryption&.dig(:primary_key)
    config.active_record.encryption.deterministic_key = Rails.application.credentials.active_record_encryption&.dig(:deterministic_key) 
    config.active_record.encryption.key_derivation_salt = Rails.application.credentials.active_record_encryption&.dig(:key_derivation_salt)
    
    # Enable compression for encrypted fields to reduce storage
    config.active_record.encryption.compressor = Zlib
    
  elsif Rails.env.development?
    # Development encryption settings - easier debugging
    config.active_record.encryption.encrypt_fixtures = true
    config.active_record.encryption.store_key_references = false
    config.active_record.encryption.extend_queries = true
    
    # Use simpler keys for development
    config.active_record.encryption.primary_key = Rails.application.credentials.active_record_encryption&.dig(:primary_key) || "dev_primary_key_#{SecureRandom.hex(16)}"
    config.active_record.encryption.deterministic_key = Rails.application.credentials.active_record_encryption&.dig(:deterministic_key) || "dev_deterministic_key_#{SecureRandom.hex(16)}"
    config.active_record.encryption.key_derivation_salt = Rails.application.credentials.active_record_encryption&.dig(:key_derivation_salt) || "dev_salt_#{SecureRandom.hex(8)}"
    
  else # test environment
    # Test encryption settings - already configured in test.rb
    config.active_record.encryption.encrypt_fixtures = true
    config.active_record.encryption.store_key_references = false
    config.active_record.encryption.extend_queries = true
  end
  
  # Global encryption settings
  config.active_record.encryption.hash_digest_class = OpenSSL::Digest::SHA256
  config.active_record.encryption.support_sha1_for_non_deterministic_encryption = false
end

# Custom encryption module for application-specific encryption logic
module ApplicationEncryption
  extend ActiveSupport::Concern
  
  # Encryption utilities for models
  module ClassMethods
    # Encrypt sensitive fields with appropriate settings
    def encrypt_sensitive_field(field_name, deterministic: false, **options)
      default_options = {
        deterministic: deterministic,
        downcase: deterministic, # Enable case-insensitive search for deterministic fields
        ignore_case: !deterministic # Ignore case for non-deterministic fields
      }
      
      encrypts field_name, **default_options.merge(options)
      
      # Add validation for encrypted fields
      validates field_name, presence: true, if: -> { send("#{field_name}_required?") }
      
      # Define a method to check if the field is required
      define_method "#{field_name}_required?" do
        false # Override in models as needed
      end
    end
    
    # Search encrypted deterministic fields
    def search_encrypted_field(field_name, value)
      return none if value.blank?
      
      # For deterministic encryption, we can search directly
      where(field_name => value)
    end
    
    # Batch decrypt for performance (use with caution)
    def with_decrypted_fields(*field_names)
      # This temporarily disables encryption for read operations
      # Use only when you need to process large amounts of encrypted data
      ActiveRecord::Encryption.without_encryption do
        yield
      end
    end
  end
  
  # Instance methods for encryption handling
  def encrypted_field_changed?(field_name)
    # Check if an encrypted field has been modified
    changes.key?(field_name.to_s) || changes.key?("#{field_name}_ciphertext")
  end
  
  def decrypt_for_display(field_name)
    # Safely decrypt a field for display purposes
    begin
      send(field_name)
    rescue ActiveRecord::Encryption::Errors::Decryption => e
      Rails.logger.error "Failed to decrypt #{field_name}: #{e.message}"
      "[Encrypted Data]"
    end
  end
end

# Encryption monitoring and logging
if Rails.env.development? || Rails.env.test?
  ActiveSupport::Notifications.subscribe('encrypt.active_record') do |name, start, finish, id, payload|
    duration = (finish - start) * 1000
    
    if duration > 10 # Log slow encryption operations
      Rails.logger.debug "🔐 Slow encryption: #{duration.round(2)}ms for #{payload[:message] || 'unknown field'}"
    end
  end
  
  ActiveSupport::Notifications.subscribe('decrypt.active_record') do |name, start, finish, id, payload|
    duration = (finish - start) * 1000
    
    if duration > 10 # Log slow decryption operations
      Rails.logger.debug "🔓 Slow decryption: #{duration.round(2)}ms for #{payload[:message] || 'unknown field'}"
    end
  end
end

# Key rotation helpers (for future use)
module EncryptionKeyRotation
  def self.rotate_keys_for_model(model_class, encrypted_fields)
    return unless Rails.env.production?
    
    Rails.logger.info "🔄 Starting key rotation for #{model_class}"
    
    model_class.find_in_batches(batch_size: 100) do |batch|
      batch.each do |record|
        encrypted_fields.each do |field|
          # Re-encrypt with new key by reading and writing the field
          value = record.send(field)
          record.update_column(field, value) if value.present?
        end
      end
    end
    
    Rails.logger.info "✅ Key rotation completed for #{model_class}"
  end
end

Rails.logger.info "🔐 Active Record Encryption configured for #{Rails.env} environment"