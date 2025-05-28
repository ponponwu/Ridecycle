# app/controllers/api/v1/auth_controller.rb
module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [:login, :register, :csrf_token]
      skip_before_action :verify_authenticity_token, only: [:login, :register, :logout]
      
      def register
        begin
          # user_params will permit :email, :password, :password_confirmation, :fullName, :phone
          permitted_params = user_params
          
          # Map fullName to name for the User model
          user_attributes = {
            email: permitted_params[:email],
            password: permitted_params[:password],
            password_confirmation: permitted_params[:password_confirmation],
            name: permitted_params[:full_name]
            # phone: permitted_params[:phone] # User model does not have phone yet
          }.compact

          user = User.new(user_attributes)
          
          if user.save
            set_auth_cookies(user) # Set both access and refresh HttpOnly cookies
            render_jsonapi_resource(user, serializer: UserSerializer, status: :created)
          else
            render_jsonapi_errors(user.errors.full_messages)
          end
        rescue ActionController::ParameterMissing => e
          render_jsonapi_errors(['Missing required parameters'], status: :bad_request, title: 'Bad Request')
        end
      end
      
      def login
        begin
          login_params = params[:data] || params
          user = User.find_by(email: login_params[:email])
          if user && user.authenticate(login_params[:password])
            set_auth_cookies(user) # Set both access and refresh HttpOnly cookies
            render_jsonapi_resource(user, serializer: UserSerializer)
          else
            render_jsonapi_errors(['Invalid email or password'], status: :unauthorized, title: 'Unauthorized')
          end
        rescue => e
          Rails.logger.error "Login error: #{e.message}"
          render_jsonapi_errors(['Login failed'], status: :internal_server_error)
        end
      end
      
      def me
        # current_user is set by authenticate_user! which now reads from cookie
        if current_user
          render_jsonapi_resource(current_user, serializer: UserSerializer)
        else
          # This case should ideally be caught by authenticate_user! itself
          render_jsonapi_errors(['Not authenticated'], status: :unauthorized, title: 'Unauthorized')
        end
      end

      def logout
        # 如果有 refresh token，將其標記為非活躍
        if current_user
          # 處理所有 refresh tokens，而不僅僅是 cookie 中的那個
          current_user.refresh_tokens.active.update_all(revoked_at: Time.current)
        end
        
        delete_auth_cookies # Delete both access and refresh HttpOnly cookies
        head :no_content
      end

      # 專門用於獲取和設置 CSRF token 的端點
      def csrf_token
        # 生成並設置 CSRF token（set_csrf_cookie 已經在 before_action 中調用）
        token = cookies['X-CSRF-Token'] || form_authenticity_token
        
        # 返回成功響應，CSRF token 已經設置在 cookie 中
        render json: { status: 'ok', token: token }
      end
      
      private
      
      def user_params
        # 處理新的前端格式：{ data: {...} }
        # 首先嘗試從 :data 鍵獲取參數，如果沒有則回退到 :auth
        if params[:data].present?
          params.require(:data).permit(:email, :password, :password_confirmation, :full_name, :agreement)
        elsif params[:auth].present?
          params.require(:auth).permit(:email, :password, :password_confirmation, :full_name, :agreement)
        else
          # 最後回退到直接從 params 獲取（適用於測試環境或其他情況）
          params.permit(:email, :password, :password_confirmation, :full_name, :agreement)
        end
      end
    end
  end
end