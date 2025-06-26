# spec/support/auth_helpers.rb
module AuthHelpers
  # 為控制器測試設置當前用戶
  def sign_in(user)
    allow(controller).to receive(:current_user).and_return(user)
    allow(controller).to receive(:logged_in?).and_return(true)
    allow(controller).to receive(:authenticate_user!).and_return(true)
  end

  # 為控制器測試設置管理員用戶
  def sign_in_admin(admin_user = nil)
    admin_user ||= create(:user, :admin)
    sign_in(admin_user)
    admin_user
  end

  # 為控制器測試設置普通用戶
  def sign_in_user(user = nil)
    user ||= create(:user)
    sign_in(user)
    user
  end

  # 清除認證
  def sign_out
    allow(controller).to receive(:current_user).and_return(nil)
    allow(controller).to receive(:logged_in?).and_return(false)
  end

  # 為 Request Spec 模擬認證用戶（使用 mock 跳過認證檢查）
  def sign_in_as(user)
    # 使用 RSpec mock 來跳過認證檢查
    # 這樣測試可以專注於業務邏輯，而不是認證細節
    allow_any_instance_of(ApplicationController).to receive(:authenticate_user!).and_return(true)
    allow_any_instance_of(ApplicationController).to receive(:current_user).and_return(user)
    allow_any_instance_of(ApplicationController).to receive(:logged_in?).and_return(true)
    
    user
  end
  
  # 為 Request Spec 生成 JWT token（僅用於調試）
  def jwt_for(user, expires_in: 24.hours.to_i)
    payload = {
      user_id: user.id,
      exp: Time.now.to_i + expires_in,
      iat: Time.now.to_i
    }
    # NOTE: Forcing a key for test env to avoid credentials loading issues in some CI/CD environments.
    secret_key = Rails.application.credentials.jwt_secret_key || 'test_secret_key_for_ci'
    JWT.encode(payload, secret_key, 'HS256')
  end
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :controller
  config.include AuthHelpers, type: :request
  config.include ActionDispatch::TestProcess::FixtureFile, type: :request
end 