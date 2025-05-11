# app/controllers/api/v1/auth_controller.rb
module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [:login, :register]
      
      def register
        # user_params will permit :email, :password, :password_confirmation, :fullName, :phone
        permitted_params = user_params
        
        # Map fullName to name for the User model
        user_attributes = {
          email: permitted_params[:email],
          password: permitted_params[:password],
          password_confirmation: permitted_params[:passwordConfirmation],
          name: permitted_params[:fullName]
          # phone: permitted_params[:phone] # User model does not have phone yet
        }.compact

        user = User.new(user_attributes)
        
        if user.save
          token = encode_token({ user_id: user.id })
          # Return user object that matches IUser (e.g. with fullName)
          # For now, default user.as_json will be used by render. Consider a serializer.
          render json: { user: user.as_json(methods: [], except: [:password_digest]), token: token }, status: :created
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

      def logout
        # For JWT, logout is primarily handled client-side by deleting the token.
        # If you have a token blacklist, you would add the token to it here.
        # For now, just return a success response.
        # This action should be protected by authenticate_user! to ensure a user is logged in to log out.
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
        params.require(:auth).permit(:email, :password, :passwordConfirmation, :fullName)
      end
    end
  end
end