module Api
  module V1
    class SessionsController < ApplicationController
      require 'google-id-token'
      
      # 如果您的 ApplicationController 有全域的 authenticate_user!，
      # 並且不希望 omniauth action 被它攔截，可以取消註解下面這行
      skip_before_action :authenticate_user!, only: [:omniauth, :auth_failure, :google_callback, :facebook_callback]
      skip_before_action :verify_authenticity_token, only: [:google_callback, :facebook_callback]

      def omniauth
        auth_hash = request.env['omniauth.auth']
        provider = auth_hash['provider']
        uid = auth_hash['uid']

        # 假設 User 模型中有 self.find_or_create_by_omniauth 方法
        user = User.find_or_create_by_omniauth(auth_hash)

        if user&.persisted?
          # For cross-site OAuth callbacks, we must explicitly set SameSite=None
          set_auth_cookies(user, samesite_policy: :none) # Set both access and refresh HttpOnly cookies

          frontend_callback_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:8080')}/auth/callback"
          
          # 使用 UserSerializer 進行序列化
          user_info_for_callback = UserSerializer.new(user).serializable_hash[:data][:attributes].to_json

          redirect_url = "#{frontend_callback_url}?user=#{CGI.escape(user_info_for_callback)}"
          
          redirect_to redirect_url, allow_other_host: true
        else
          error_message = user&.errors&.full_messages&.join(', ') || "OmniAuth user processing failed. User might have validation errors."
          # 重定向到前端的登入頁面並帶上錯誤訊息
          redirect_to "#{ENV.fetch('FRONTEND_URL', 'http://localhost:8080')}/login?error=#{CGI.escape(error_message)}", allow_other_host: true
        end
      rescue StandardError => e
        Rails.logger.error "OmniAuth Error: #{e.message}\n#{e.backtrace.join("\n")}"
        redirect_to "#{ENV.fetch('FRONTEND_URL', 'http://localhost:8080')}/login?error=#{CGI.escape('An unexpected error occurred during authentication.')}", allow_other_host: true
      end

      def auth_failure
        error_message = params[:message] || "Authentication failed"
        redirect_to "#{ENV.fetch('FRONTEND_URL', 'http://localhost:8080')}/login?error=#{CGI.escape(error_message)}", allow_other_host: true
      end

      # 處理來自前端的 Google OAuth token (支持兩種模式)
      def google_callback
        # 檢查是否有嵌套在 session 參數中的資料
        if params[:session].present?
          session_params = params[:session]
          # credential = session_params[:credential]
          access_token = session_params[:access_token]
          user_info = session_params[:user_info]
        else
          # 向後兼容：直接從頂層參數讀取
          # credential = params[:credential]
          access_token = params[:access_token]
          user_info = params[:user_info]
        end
        
        if access_token.blank?
          render_jsonapi_errors(['Google Access token is required'], status: :bad_request)
          return
        end

        begin
          auth_hash = nil
          
          if access_token.present? && user_info.present?
            # 模式2: Access Token + 用戶資訊 (新方式)
            # 驗證 access token (可選，但建議驗證)
            verified_info = verify_google_access_token(access_token)
            
            if verified_info.nil?
              render_jsonapi_errors(['Invalid Google access token'], status: :unauthorized)
              return
            end
            
            auth_hash = {
              'provider' => 'google_oauth2',
              'uid' => user_info['id'],
              'info' => {
                'email' => user_info['email'],
                'name' => user_info['name'],
                'first_name' => user_info['given_name'],
                'last_name' => user_info['family_name'],
                'image' => user_info['picture']
              }
            }
          end

          user = User.find_or_create_by_omniauth(auth_hash)

          if user&.persisted?
            # For cross-site OAuth callbacks, we must explicitly set SameSite=None
          set_auth_cookies(user, samesite_policy: :none)
            render_jsonapi_resource(user, serializer: UserSerializer, status: :ok)
          else
            error_message = user&.errors&.full_messages&.join(', ') || "User creation failed"
            render_jsonapi_errors([error_message], status: :unprocessable_entity)
          end

        rescue GoogleIDToken::ValidationError => e
          Rails.logger.error "Google token verification failed: #{e.message}"
          render_jsonapi_errors(['Invalid Google token'], status: :unauthorized)
        rescue StandardError => e
          Rails.logger.error "Google callback error: #{e.message}"
          render_jsonapi_errors(['Authentication failed'], status: :internal_server_error)
        end
      end

      # 處理來自前端的 Facebook access token
      def facebook_callback
        access_token = params[:access_token]
        user_info = params[:user_info]
        
        if access_token.blank?
          render_jsonapi_errors(['Facebook access token is required'], status: :bad_request)
          return
        end

        begin
          # 驗證 Facebook access token
          app_id = ENV['FACEBOOK_APP_ID']
          verified_user_info = verify_facebook_token(access_token, app_id)
          
          if verified_user_info.nil?
            render_jsonapi_errors(['Invalid Facebook token'], status: :unauthorized)
            return
          end

          # 構建 auth_hash 格式與 OmniAuth 相容
          auth_hash = {
            'provider' => 'facebook',
            'uid' => verified_user_info['id'],
            'info' => {
              'email' => verified_user_info['email'],
              'name' => verified_user_info['name'],
              'first_name' => verified_user_info['name']&.split(' ')&.first,
              'last_name' => verified_user_info['name']&.split(' ')&.last,
              'image' => verified_user_info.dig('picture', 'data', 'url')
            }
          }

          user = User.find_or_create_by_omniauth(auth_hash)

          if user&.persisted?
            # For cross-site OAuth callbacks, we must explicitly set SameSite=None
          set_auth_cookies(user, samesite_policy: :none)
            render_jsonapi_resource(user, serializer: UserSerializer, status: :ok)
          else
            error_message = user&.errors&.full_messages&.join(', ') || "User creation failed"
            render_jsonapi_errors([error_message], status: :unprocessable_entity)
          end

        rescue StandardError => e
          Rails.logger.error "Facebook callback error: #{e.message}"
          render_jsonapi_errors(['Authentication failed'], status: :internal_server_error)
        end
      end

      private

      # 驗證 Google access token
      def verify_google_access_token(access_token)
        require 'net/http'
        require 'json'
        
        # 使用 Google API 驗證 access token
        token_url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=#{access_token}"
        
        uri = URI(token_url)
        response = Net::HTTP.get_response(uri)
        if response.code == '200'
          token_data = JSON.parse(response.body)
          
          # 檢查 token 是否屬於我們的應用程式
          client_id = ENV['GOOGLE_CLIENT_ID']
          if token_data['audience'] == client_id || token_data['azp'] == client_id
            token_data
          else
            Rails.logger.error "Google access token audience mismatch"
            nil
          end
        else
          Rails.logger.error "Google access token verification failed: #{response.body}"
          nil
        end
      rescue => e
        Rails.logger.error "Google access token verification error: #{e.message}"
        nil
      end

      # 驗證 Facebook access token
      def verify_facebook_token(access_token, app_id)
        # 使用 Facebook Graph API 驗證 token 並獲取用戶資訊
        require 'net/http'
        require 'json'
        
        # 首先驗證 token 是否有效
        token_url = "https://graph.facebook.com/debug_token?input_token=#{access_token}&access_token=#{app_id}|#{ENV['FACEBOOK_APP_SECRET']}"
        
        uri = URI(token_url)
        response = Net::HTTP.get_response(uri)
        
        if response.code != '200'
          Rails.logger.error "Facebook token verification failed: #{response.body}"
          return nil
        end
        
        token_data = JSON.parse(response.body)
        
        # 檢查 token 是否有效且屬於我們的應用程式
        if token_data.dig('data', 'is_valid') != true || token_data.dig('data', 'app_id') != app_id
          Rails.logger.error "Invalid Facebook token or app_id mismatch"
          return nil
        end
        
        # 獲取用戶資訊
        user_url = "https://graph.facebook.com/me?access_token=#{access_token}&fields=id,name,email,picture"
        
        user_uri = URI(user_url)
        user_response = Net::HTTP.get_response(user_uri)
        
        if user_response.code == '200'
          JSON.parse(user_response.body)
        else
          Rails.logger.error "Failed to get Facebook user info: #{user_response.body}"
          nil
        end
      end
    end
  end
end