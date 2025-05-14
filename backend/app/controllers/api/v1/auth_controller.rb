# app/controllers/api/v1/auth_controller.rb
module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [:login, :register]
      skip_before_action :verify_authenticity_token, only: [:login, :register]
      
      def register
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
          render json: { user: UserSerializer.new(user).serializable_hash[:data][:attributes] }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      def login
        user = User.find_by(email: params[:email])
        
        if user && user.authenticate(params[:password])
          set_auth_cookies(user) # Set both access and refresh HttpOnly cookies
          render json: { user: UserSerializer.new(user).serializable_hash[:data][:attributes] }
        else
          render json: { error: 'Invalid email or password' }, status: :unauthorized
        end
      end
      
      def me
        # current_user is set by authenticate_user! which now reads from cookie
        if @current_user
          render json: { user: UserSerializer.new(@current_user).serializable_hash[:data][:attributes] }
        else
          # This case should ideally be caught by authenticate_user! itself
          render json: { error: 'Not authenticated' }, status: :unauthorized
        end
      end

      def logout
        delete_auth_cookies # Delete both access and refresh HttpOnly cookies
        head :no_content
      end
      
      private
      
      def user_params
        # Permit parameters that frontend sends.
        # The :auth key seems to be an issue with how frontend is sending data.
        # Assuming parameters are nested under an 'auth' key due to wrap_parameters or frontend structure.
        # If frontend sends flat params, this should be params.permit(...)
        # Based on log: Parameters: {"email"=>"...", "auth"=>{"email"=>"..."}} -> it seems params are flat, but also nested under :auth by wrap_parameters
        # Let's try requiring :auth first. If that fails, it means wrap_parameters is not acting as expected or frontend is truly flat.
        # The log "Unpermitted parameters: ... :auth" suggests :auth itself is a parameter at the top level.
        # This implies wrap_parameters might be wrapping based on controller name 'auth'.
        params.require(:auth).permit(:email, :password, :password_confirmation, :full_name, :agreement)
      end
    end
  end
end