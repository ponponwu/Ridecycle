# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # CSRF token 路由
      get '/csrf_token', to: 'auth#csrf_token'

      # 認證路由
      post '/register', to: 'auth#register'
      post '/login', to: 'auth#login'
      get '/me', to: 'auth#me'
      post '/logout', to: 'auth#logout'
      post '/auth/refresh', to: 'refresh#create' # Route for refreshing token

      # OmniAuth callback route
      match '/auth/:provider/callback', to: 'sessions#omniauth', via: [:get, :post]
      get '/auth/failure', to: 'sessions#auth_failure'
      
      # 自行車路由
      resources :bicycles do
        collection do
          get :me # Route for /api/v1/bicycles/me
        end
        resources :images, only: [:create, :destroy]
      end
      
      # 訊息路由
      resources :messages, only: [:index, :show, :create]

      # Order routes
      resources :orders, only: [:create] do # Assuming create for now, add others if needed
        collection do
          get :me # Route for /api/v1/orders/me
        end
      end
    end
  end
end