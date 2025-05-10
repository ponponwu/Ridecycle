# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    allowed_origins = [
      'http://localhost:3000',
      'http://localhost:8080'
    ]
    
    # 從環境變數獲取部署網域
    if ENV["FRONTEND_URL"].present?
      allowed_origins << ENV["FRONTEND_URL"]
    end
    
    origins allowed_origins
    # Railway 部署後用 (根據你的實際部署情況調整)
    # origins 'https://yourapp.railway.app', 'https://your-app-name.up.railway.app'
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end