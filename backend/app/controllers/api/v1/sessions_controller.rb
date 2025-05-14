module Api
  module V1
    class SessionsController < ApplicationController
      # 如果您的 ApplicationController 有全域的 authenticate_user!，
      # 並且不希望 omniauth action 被它攔截，可以取消註解下面這行
      # skip_before_action :authenticate_user!, only: [:omniauth, :auth_failure]

      def omniauth
        auth_hash = request.env['omniauth.auth']
        provider = auth_hash['provider']
        uid = auth_hash['uid']

        # 假設 User 模型中有 self.find_or_create_by_omniauth 方法
        user = User.find_or_create_by_omniauth(auth_hash)

        if user&.persisted?
          set_auth_cookies(user) # Set both access and refresh HttpOnly cookies

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
    end
  end
end