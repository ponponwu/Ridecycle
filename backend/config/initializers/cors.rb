# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do

    allowed_origins = []
    if Rails.env.development?
      allowed_origins += [
        'http://localhost:3000',
        'http://localhost:8080'
      ]
    end
    
    if Rails.env.production?
      # 如果設置了前端URL環境變數，則使用它
      if ENV["FRONTEND_URL"].present?
        allowed_origins << ENV["FRONTEND_URL"]
      end
      
      # 可選：添加其他可能的前端域名格式
      # allowed_origins << "https://#{ENV['RAILWAY_STATIC_URL']}" if ENV['RAILWAY_STATIC_URL'].present?
    end
    
    origins allowed_origins.empty? ? '*' : allowed_origins
    # Railway 部署後用 (根據你的實際部署情況調整)
    # origins 'https://yourapp.railway.app', 'https://your-app-name.up.railway.app'
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end