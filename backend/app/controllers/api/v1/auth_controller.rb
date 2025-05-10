# app/controllers/api/v1/auth_controller.rb
module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user, only: [:login, :register]
      
      def register
        user = User.new(user_params)
        
        if user.save
          token = encode_token({ user_id: user.id })
          render json: { user: user, token: token }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def login
        user = User.find_by(email: params[:email])
        
        if user && user.authenticate(params[:password])
          token = encode_token({ user_id: user.id })
          render json: { user: user, token: token }
        else
          render json: { error: 'Invalid email or password' }, status: :unauthorized
        end
      end
      
      def me
        render json: { user: @current_user }
      end
      
      private
      
      def user_params
        params.permit(:name, :email, :password)
      end
    end
  end
end