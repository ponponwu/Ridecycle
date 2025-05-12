module Api
  module V1
    class RefreshController < ApplicationController
      # No need for authenticate_user! before_action here, 
      # as this endpoint relies on the refresh_token_cookie itself for authentication.
      # However, if refresh token is invalid/expired, it should not grant a new access token.
      skip_before_action :authenticate_user!, only: [:create]

      def create
        jwt_payload = decoded_token(:refresh)

        if jwt_payload.nil? || jwt_payload == :expired
          delete_auth_cookies
          render json: { error: 'Invalid or expired refresh token.' }, status: :unauthorized
          return
        end

        user_id = jwt_payload[0]['user_id']
        jti = jwt_payload[0]['jti']

        unless user_id && jti
          delete_auth_cookies
          render json: { error: 'Invalid refresh token payload.' }, status: :unauthorized
          return
        end

        user = User.find_by(id: user_id)
        db_refresh_token = RefreshToken.find_by(user_id: user_id, token: jti)

        if user && db_refresh_token&.active?
          db_refresh_token.update(revoked_at: Time.current)
          set_auth_cookies(user)
          render json: { message: 'Tokens refreshed successfully.' }, status: :ok
        else
          delete_auth_cookies(user)
          render json: { error: 'Invalid or revoked refresh token.' }, status: :unauthorized
        end
      rescue StandardError => e
        Rails.logger.error "Refresh Token Error: #{e.message}\n#{e.backtrace.join("\n")}" # Keep this important error log
        delete_auth_cookies
        render json: { error: 'An unexpected error occurred during token refresh.' }, status: :internal_server_error
      end
    end
  end
end