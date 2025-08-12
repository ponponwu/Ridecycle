class User < ApplicationRecord
  # Include application encryption helpers
  include ApplicationEncryption
  
  has_secure_password
  
  # Rails 7 Active Record Encryption - Enhanced Coverage
  # 加密敏感的銀行帳戶資訊
  encrypts :bank_account_name, deterministic: false
  encrypts :bank_account_number, deterministic: false  
  encrypts :bank_code, deterministic: false
  encrypts :bank_branch, deterministic: false
  
  # 擴展加密範圍 - Phase 2 Enhancement
  # 加密 email 以保護用戶隱私（使用確定性加密以支援查詢）
  # TEMPORARILY DISABLED: Email encryption causing login issues due to dynamic keys
  # encrypts :email, deterministic: true, downcase: true
  
  # 加密電話號碼（如果有的話）
  encrypts :phone_number, deterministic: false, ignore_case: true if column_names.include?('phone_number')
  
  has_many :bicycles, dependent: :destroy
  has_many :sent_messages, class_name: 'Message', foreign_key: 'sender_id', dependent: :destroy
  has_many :received_messages, class_name: 'Message', foreign_key: 'recipient_id', dependent: :destroy
  has_many :orders, dependent: :destroy
  has_many :refresh_tokens, dependent: :destroy # For stateful refresh tokens
  has_many :feedbacks, dependent: :destroy
  
  # Override common includes for User model to prevent N+1 queries
  scope :with_common_includes, -> { includes(:bicycles, :orders) }
  scope :with_full_includes, -> { includes(:bicycles, :sent_messages, :received_messages, :orders, :refresh_tokens) }
  
  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
  
  # 銀行戶頭驗證
  with_options if: :bank_account_required? do |user|
    user.validates :bank_account_name, presence: true
    user.validates :bank_account_number, 
      presence: true, 
      format: { with: /\A[\d\-]+\z/, message: '只能包含數字和連字符' }
    user.validates :bank_code, 
      presence: true, 
      format: { with: /\A\d{3}\z/, message: '必須為3位數字' }
    user.validates :bank_branch, presence: true
  end

  # =====================================
  # User Information Methods
  # =====================================
  
  # 添加 full_name 方法，與前端期望的介面一致
  def full_name
    name
  end

  # =====================================
  # Admin & Permissions Methods
  # =====================================
  
  def admin?
    admin
  end
  
  def make_admin!
    update!(admin: true)
  end
  
  def remove_admin!
    update!(admin: false)
  end

  # =====================================
  # User Status Management Methods
  # =====================================
  
  def suspicious?
    is_suspicious
  end
  
  def blacklisted?
    is_blacklisted
  end
  
  def mark_suspicious!
    update!(is_suspicious: true)
  end
  
  def unmark_suspicious!
    update!(is_suspicious: false)
  end
  
  def blacklist!
    update!(is_blacklisted: true)
  end
  
  def unblacklist!
    update!(is_blacklisted: false)
  end

  # =====================================
  # Bank Account Management Methods
  # =====================================

  def bank_account_complete?
    bank_account_name.present? && 
    bank_account_number.present? && 
    bank_code.present? && 
    bank_branch.present?
  end

  def bank_account_info
    return nil unless bank_account_complete?
    
    {
      account_name: bank_account_name,
      account_number: bank_account_number_masked, # 使用遮罩版本確保安全
      bank_code: bank_code,
      bank_branch: bank_branch,
      created_at: created_at&.iso8601,
      updated_at: updated_at&.iso8601
    }
  end

  # 提供完整的銀行帳號（用於確認更新操作）
  def bank_account_info_unmasked
    return nil unless bank_account_complete?
    
    {
      account_name: bank_account_name,
      account_number: bank_account_number, # 完整版本
      bank_code: bank_code,
      bank_branch: bank_branch,
      created_at: created_at&.iso8601,
      updated_at: updated_at&.iso8601
    }
  end

  # 提供遮罩的銀行帳號（僅顯示後5碼）
  def bank_account_number_masked
    return nil unless bank_account_number.present?
    return bank_account_number if bank_account_number.length <= 5
    
    '*' * (bank_account_number.length - 5) + bank_account_number.last(5)
  end

  def update_bank_account(params)
    update!(
      bank_account_name: params[:bank_account_name],
      bank_account_number: params[:bank_account_number],
      bank_code: params[:bank_code],
      bank_branch: params[:bank_branch]
    )
  end

  # =====================================
  # OAuth & Authentication Methods
  # =====================================

  # Check if user is an OAuth user (registered via Facebook, Google, etc.)
  def oauth_user?
    provider.present? && uid.present?
  end

  # Check if OAuth user has never set a custom password
  def needs_password_setup?
    oauth_user? && !password_manually_set?
  end

  # Check if user has manually set their password (not just the auto-generated one)
  def password_manually_set?
    # If user has custom_password_set attribute, use it
    return custom_password_set if respond_to?(:custom_password_set)
    
    # Fallback: assume non-OAuth users have set their password
    !oauth_user?
  end

  # Mark that user has manually set their password
  def mark_password_as_manually_set!
    # If custom_password_set column exists, use it
    if respond_to?(:custom_password_set=)
      update!(custom_password_set: true)
    end
  end

  # Finds an existing user or creates a new one from OmniAuth data
  # Assumes 'provider' and 'uid' columns exist on the User model.
  # Enforces email uniqueness across the system.
  def self.find_or_create_by_omniauth(auth_hash)
    provider = auth_hash['provider']
    uid = auth_hash['uid']&.to_s
    email = auth_hash['info']['email']&.downcase
    name = auth_hash['info']['name'] || "#{auth_hash['info']['first_name']} #{auth_hash['info']['last_name']}".strip

    # 1. Try to find existing user by provider and UID
    existing_user = find_existing_user_by_oauth(provider, uid)
    return existing_user if existing_user

    # 2. Handle email conflicts and linking
    if email.present?
      result = handle_email_linking(email, provider, uid, name)
      return result if result
    else
      return create_user_with_error(:email, :blank, "is required for registration. #{provider.titleize} did not provide an email.", name, provider, uid)
    end

    # 3. Create new user
    create_new_oauth_user(email, name, provider, uid)
  end

  private

  # =====================================
  # OAuth Helper Methods
  # =====================================

  def self.find_existing_user_by_oauth(provider, uid)
    find_by(provider: provider, uid: uid)
  end

  def self.handle_email_linking(email, provider, uid, name)
    existing_user_by_email = find_by(email: email)
    return nil unless existing_user_by_email

    # Link OAuth to existing local account
    if existing_user_by_email.provider.blank? && existing_user_by_email.uid.blank?
      existing_user_by_email.update(provider: provider, uid: uid)
      return existing_user_by_email if existing_user_by_email.persisted?
    else
      # Email conflict with different OAuth account
      Rails.logger.warn "OmniAuth: Email #{email} already in use by user ID #{existing_user_by_email.id} (provider: #{existing_user_by_email.provider}, uid: #{existing_user_by_email.uid}). Cannot link to new provider #{provider} / uid #{uid} automatically."
      return create_user_with_error(:email, :taken, "is already associated with another account. Please log in with that account or use a different email for this provider.", name, provider, uid)
    end
  end

  def self.create_new_oauth_user(email, name, provider, uid)
    password = SecureRandom.hex(10)
    new_user = new(
      email: email,
      name: name,
      password: password,
      password_confirmation: password,
      provider: provider,
      uid: uid
    )

    if new_user.save
      new_user
    else
      Rails.logger.error "OmniAuth User Creation Failed: Provider: #{provider}, UID: #{uid}, Email: #{email}"
      Rails.logger.error "Errors: #{new_user.errors.full_messages.join(', ')}"
      new_user
    end
  end

  def self.create_user_with_error(field, error_type, message, name, provider, uid)
    user_with_errors = User.new(name: name, provider: provider, uid: uid)
    user_with_errors.errors.add(field, error_type, message: message)
    user_with_errors
  end

  # =====================================
  # Bank Account Helper Methods
  # =====================================

  def bank_account_required?
    # 當用戶有出售中的腳踏車時，需要銀行戶頭資訊
    bicycles.exists?(status: 'available') || 
    # 或者用戶有已接受的出價需要收款時
    Message.joins(:bicycle)
           .where(bicycles: { user_id: id })
           .where(is_offer: true, offer_status: 'accepted')
           .exists?
  end
end