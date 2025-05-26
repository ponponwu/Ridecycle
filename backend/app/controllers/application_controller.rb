# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  include ActionController::Cookies
  include ActionController::RequestForgeryProtection
  protect_from_forgery with: :exception # API 模式使用 :null_session 而非 :exception
  before_action :set_csrf_cookie
  before_action :authenticate_user!

  private

  def set_csrf_cookie
    token = cookies['CSRF-TOKEN'] || form_authenticity_token
    Rails.logger.info "====== Generating or Exist CSRF token: #{token} ======"
    
    # 確保 cookie 正確設置，不受同源策略限制
    cookies['CSRF-TOKEN'] = {
      value: token,
      same_site: 'None', # 允許跨站點請求
      secure: true,      # 要求使用 HTTPS
      httponly: false,   # 允許 JavaScript 訪問
      path: '/'          # 適用於整個網站
    }
    
    # 同時設置為標準 Rails CSRF token (可能會被 ActionDispatch::Cookies 使用)
    cookies['X-CSRF-Token'] = {
      value: token,
      same_site: 'None',
      secure: true,
      httponly: false, 
      path: '/'
    }
    
    # 確認 cookie 是否成功設置
    Rails.logger.info "====== Set CSRF token cookies ======"
    Rails.logger.info "====== Cookies after setting: #{cookies.to_h.inspect} ======"
    
    # 在響應標頭中也設置 CSRF token，提供備用方式訪問
    response.headers['X-CSRF-Token'] = token
  end
  
  def encode_token(payload, exp = 1.hour.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, Rails.application.credentials.jwt_secret!)
  end

  def encode_refresh_token(user_id, jti, exp = 7.days.from_now)
    payload = { user_id: user_id, jti: jti, exp: exp.to_i, type: 'refresh' }
    refresh_secret = Rails.application.credentials.jwt_refresh_secret || Rails.application.credentials.jwt_secret!
    JWT.encode(payload, refresh_secret)
  end
  
  def access_token_from_cookie
    cookies.signed[:access_token_cookie]
  end

  def refresh_token_from_cookie
    cookies.signed[:refresh_token_cookie]
  end
  
  def decoded_token(token_type = :access)
    token = (token_type == :access) ? access_token_from_cookie : refresh_token_from_cookie
    secret_key = (token_type == :access) ? Rails.application.credentials.jwt_secret! : (Rails.application.credentials.jwt_refresh_secret || Rails.application.credentials.jwt_secret!)
    
    if token
      begin
        JWT.decode(token, secret_key, true, algorithm: 'HS256')
      rescue JWT::ExpiredSignature
        return :expired 
      rescue JWT::DecodeError
        nil 
      end
    end
  end
  
  def current_user
    return @current_user if defined?(@current_user)

    decoded_payload = decoded_token(:access)
    
    if decoded_payload && decoded_payload != :expired && decoded_payload[0]['user_id']
      user_id = decoded_payload[0]['user_id']
      @current_user = User.find_by(id: user_id)
    else
      @current_user = nil
    end
    @current_user
  end
  
  def logged_in?
    !!current_user
  end
  
  def authenticate_user!
    unless logged_in?
      if request.path.start_with?('/api/v1/me')
        render json: { error: 'Please log in' }, status: :unauthorized
      else
        # 對於其他需要驗證的路由，我們仍然返回 401
        render json: { error: 'Authentication required' }, status: :unauthorized
      end
    end
  end

  protected

  def set_auth_cookies(user)
    set_access_token_cookie(user)
    set_refresh_token_cookie(user)
  end

  def set_access_token_cookie(user)
    access_token_payload = { user_id: user.id }
    token = encode_token(access_token_payload) 
    
    cookies.signed[:access_token_cookie] = {
      value: token,
      httponly: true,
      secure: Rails.env.production?,
      same_site: :lax,
    }
  end

  def set_refresh_token_cookie(user)
    jti = SecureRandom.uuid 
    expires_at = 7.days.from_now
    
    user.refresh_tokens.active.update_all(revoked_at: Time.current)

    db_refresh_token = user.refresh_tokens.create(
      token: jti, 
      expires_at: expires_at
    )

    if db_refresh_token.persisted?
      jwt_refresh_token = encode_refresh_token(user.id, jti, expires_at)
      
      cookies.signed[:refresh_token_cookie] = {
        value: jwt_refresh_token,
        httponly: true,
        secure: Rails.env.production?,
        expires: expires_at,
        same_site: :lax,
        path: '/' 
      }
    else
      Rails.logger.error "Failed to save refresh token to database for user #{user.id}: #{db_refresh_token.errors.full_messages.join(', ')}"
    end
  end

  def delete_auth_cookies(user_to_logout = nil)
    user_for_revoke = user_to_logout || @current_user 

    if user_for_revoke
      user_for_revoke.refresh_tokens.active.update_all(revoked_at: Time.current)
    else
      payload = decoded_token(:refresh) 
      if payload && payload != :expired && payload[0]['jti'] && payload[0]['user_id']
        found_token = RefreshToken.find_by(token: payload[0]['jti'], user_id: payload[0]['user_id'])
        found_token&.active?&.update(revoked_at: Time.current)
      end
    end

    cookies.delete(:access_token_cookie, path: '/')
    cookies.delete(:refresh_token_cookie, path: '/')
  end
end