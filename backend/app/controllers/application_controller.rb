# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  before_action :authenticate_user!
  
  def encode_token(payload)
    JWT.encode(payload, Rails.application.credentials.jwt_secret)
  end
  
  def auth_header
    request.headers['Authorization']
  end
  
  def decoded_token
    if auth_header
      token = auth_header.split(' ')[1]
      begin
        JWT.decode(token, Rails.application.credentials.jwt_secret, true, algorithm: 'HS256')
      rescue JWT::DecodeError
        nil
      end
    end
  end
  
  def current_user
    if decoded_token
      user_id = decoded_token[0]['user_id']
      @current_user = User.find_by(id: user_id)
    end
  end
  
  def logged_in?
    !!current_user
  end
  
  def authenticate_user!
    render json: { error: 'Please log in' }, status: :unauthorized unless logged_in?
  end
end