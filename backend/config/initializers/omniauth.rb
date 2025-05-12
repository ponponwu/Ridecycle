# config/initializers/omniauth.rb
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET'], {
    scope: 'email,profile',
    prompt: 'select_account',
    image_aspect_ratio: 'square',
    image_size: 50
    # access_type: 'offline' # if you need refresh tokens
  }
  provider :facebook, ENV['FACEBOOK_APP_ID'], ENV['FACEBOOK_APP_SECRET'], {
    scope: 'email,public_profile',
    info_fields: 'email,name,first_name,last_name,picture'
  }
end
OmniAuth.config.allowed_request_methods = [:post, :get] # Allow GET for callback in some cases, though POST is preferred
OmniAuth.config.silence_get_warning = true # If using GET for callback during development
