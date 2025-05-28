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
end

RSpec.configure do |config|
  config.include AuthHelpers, type: :controller
end 