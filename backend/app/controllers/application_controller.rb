# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  include ActionController::Cookies
  include JsonApiResponse
  include ActionController::RequestForgeryProtection
  
  # 在測試環境中跳過 CSRF 保護，其他環境使用 :null_session
  unless Rails.env.test?
    protect_from_forgery with: :null_session
    before_action :set_csrf_cookie
  end
  
  before_action :authenticate_user!

  private

  def set_csrf_cookie
    token = cookies['X-CSRF-Token'] || form_authenticity_token
    
    # 設置 CSRF token cookie，根據環境調整安全設置
    cookies['X-CSRF-Token'] = {
      value: token,
      same_site: Rails.env.development? ? :lax : 'None', # 開發環境使用 lax，生產環境使用 None
      secure: Rails.env.production?,      # 只有生產環境要求 HTTPS
      httponly: false,   # 允許 JavaScript 訪問
      path: '/'          # 適用於整個網站
    }
    
    # 在響應標頭中也設置 CSRF token，提供備用方式訪問
    response.headers['X-CSRF-Token'] = token
  end
  
  def encode_token(payload, exp = 1.hour.from_now)
    payload[:exp] = exp.to_i
    # 使用正確的密鑰名稱，並提供備用
    secret_key = Rails.application.credentials.jwt_secret_key || 'test_secret_key_for_ci'
    JWT.encode(payload, secret_key)
  end

  def encode_refresh_token(user_id, jti, exp = 7.days.from_now)
    payload = { user_id: user_id, jti: jti, exp: exp.to_i, type: 'refresh' }
    refresh_secret = Rails.application.credentials.jwt_refresh_secret || Rails.application.credentials.jwt_secret_key || 'test_secret_key_for_ci'
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
    # 使用正確的密鑰名稱，並提供備用
    secret_key = if token_type == :access
                   Rails.application.credentials.jwt_secret_key || 'test_secret_key_for_ci'
                 else
                   Rails.application.credentials.jwt_refresh_secret || Rails.application.credentials.jwt_secret_key || 'test_secret_key_for_ci'
                 end
    
    if token
      begin
        JWT.decode(token, secret_key, true, algorithm: 'HS256')
      rescue JWT::ExpiredSignature => e
        return :expired 
      rescue JWT::DecodeError => e
        nil 
      end
    else
      nil
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
        render_jsonapi_errors(['Please log in'], status: :unauthorized, title: 'Unauthorized')
      else
        # 對於其他需要驗證的路由，我們仍然返回 401
        render_jsonapi_errors(['Authentication required'], status: :unauthorized, title: 'Unauthorized')
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