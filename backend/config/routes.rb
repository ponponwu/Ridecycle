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
          get :featured # Route for /api/v1/bicycles/featured
          get :recently_added # Route for /api/v1/bicycles/recently_added
        end
        resources :images, only: [:create, :destroy]
      end
      
      # 訊息路由
      resources :messages, only: [:index, :show, :create]

      # 品牌路由
      resources :brands, only: [:index, :show, :create]
      
      # 型號路由
      resources :bicycle_models, only: [:index, :show, :create]
      
      # 變速系統路由
      resources :transmissions, only: [:index, :show, :create]
      
      # 目錄資料路由
      get '/catalog', to: 'catalog#index'

      # 安全路由
      namespace :security do
        post '/csp-violations', to: 'security#csp_violations'
        get '/status', to: 'security#status'
        get '/violations/stats', to: 'security#violation_stats'
      end

      # Order routes
      resources :orders, only: [:create] do # Assuming create for now, add others if needed
        collection do
          get :me # Route for /api/v1/orders/me
        end
      end

      # Admin routes
      namespace :admin do
        # Dashboard routes
        get '/dashboard/stats', to: 'dashboard#stats'
        get '/dashboard/recent_activity', to: 'dashboard#recent_activity'
        
        # Admin bicycle management
        resources :bicycles do
          member do
            patch :approve
            patch :reject
          end
        end
        
        # Admin user management (future implementation)
        # resources :users do
        #   member do
        #     patch :make_admin
        #     patch :remove_admin
        #   end
        # end
      end
    end
  end
end