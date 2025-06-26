class User < ApplicationRecord
  has_secure_password
  
  # 加密敏感的銀行帳戶資訊
  encrypts :bank_account_name, deterministic: false
  encrypts :bank_account_number, deterministic: false  
  encrypts :bank_code, deterministic: false
  encrypts :bank_branch, deterministic: false
  
  has_many :bicycles, dependent: :destroy
  has_many :sent_messages, class_name: 'Message', foreign_key: 'sender_id', dependent: :destroy
  has_many :received_messages, class_name: 'Message', foreign_key: 'recipient_id', dependent: :destroy
  has_many :orders, dependent: :destroy
  has_many :refresh_tokens, dependent: :destroy # For stateful refresh tokens
  
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
  
  # 添加 full_name 方法，與前端期望的介面一致
  def full_name
    name
  end
  
  # Admin methods
  def admin?
    admin
  end
  
  def make_admin!
    update!(admin: true)
  end
  
  def remove_admin!
    update!(admin: false)
  end

  # 銀行戶頭相關方法
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

  # Finds an existing user or creates a new one from OmniAuth data
  # Assumes 'provider' and 'uid' columns exist on the User model.
  # Enforces email uniqueness across the system.
  def self.find_or_create_by_omniauth(auth_hash)
    provider = auth_hash['provider']
    uid = auth_hash['uid']&.to_s # Ensure uid is a string
    email = auth_hash.info.email&.downcase
    name = auth_hash.info.name || "#{auth_hash.info.first_name} #{auth_hash.info.last_name}".strip
    # avatar_url = auth_hash.info.image # Consider handling avatar later

    # 1. Try to find the user by provider and UID. This is the most reliable way.
    user = find_by(provider: provider, uid: uid)
    return user if user 

    # 2. If email is provided by OmniAuth, check if it's already in use.
    if email.present?
      existing_user_by_email = find_by(email: email)
      if existing_user_by_email
        # Email exists.
        # If this existing user does NOT have provider/uid set (i.e., it's a local account),
        # we can link this OmniAuth login to that existing local account.
        if existing_user_by_email.provider.blank? && existing_user_by_email.uid.blank?
          existing_user_by_email.update(provider: provider, uid: uid)
          return existing_user_by_email if existing_user_by_email.persisted? # Check if update was successful
        else
          # Email is already taken by another account (either local with different credentials or another OmniAuth provider).
          # Since email must be strictly unique, we cannot create a new user with this email,
          # nor can we automatically link if it's already linked to a different provider/uid.
          Rails.logger.warn "OmniAuth: Email #{email} already in use by user ID #{existing_user_by_email.id} (provider: #{existing_user_by_email.provider}, uid: #{existing_user_by_email.uid}). Cannot link to new provider #{provider} / uid #{uid} automatically."
          # Return an instance with errors to indicate the conflict.
          # The controller should handle this by informing the user.
          user_with_errors = User.new(email: email, name: name, provider: provider, uid: uid)
          user_with_errors.errors.add(:email, :taken, message: "is already associated with another account. Please log in with that account or use a different email for this provider.")
          return user_with_errors
        end
      end
    else
      # OmniAuth provider did not return an email.
      # Depending on your app's requirements, you might:
      # - Disallow login/registration without an email.
      # - Prompt the user to enter an email.
      # - Create a user without an email (if your User model allows it, though 'validates :email, presence: true' prevents this).
      Rails.logger.warn "OmniAuth: No email provided by #{provider} for UID #{uid}."
      user_with_errors = User.new(name: name, provider: provider, uid: uid)
      user_with_errors.errors.add(:email, :blank, message: "is required for registration. #{provider.titleize} did not provide an email.")
      return user_with_errors
    end

    # 3. If no existing user was found and email is not conflicting (or not provided but allowed), create a new user.
    # This part is reached if:
    #   a) No user found by provider/uid.
    #   b) Email was provided by OmniAuth, and no existing user has this email.
    #   c) Email was NOT provided by OmniAuth, AND your User model allows email to be blank (which it currently doesn't due to validation).
    
    password = SecureRandom.hex(10) # Generate a more secure random password
    new_user = new(
      email: email, # This will be nil if not provided by OmniAuth and User model allows it
      name: name,
      password: password,
      password_confirmation: password,
      provider: provider,
      uid: uid
    )

    if new_user.save
      return new_user
    else
      Rails.logger.error "OmniAuth User Creation Failed:"
      Rails.logger.error "Provider: #{provider}, UID: #{uid}, Email: #{email}"
      Rails.logger.error "Errors: #{new_user.errors.full_messages.join(', ')}"
      return new_user # Return user object with errors for controller to handle
    end
  end

  private

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