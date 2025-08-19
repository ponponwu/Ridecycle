# config/routes.rb
Rails.application.routes.draw do
  # Health check and root route for backend API
  root 'api/v1/health#index'
  get '/health', to: 'api/v1/health#index'
  
  # OmniAuth callback routes (OmniAuth middleware handles /auth/:provider automatically)
  match '/auth/:provider/callback', to: 'api/v1/sessions#omniauth', via: [:get, :post]
  get '/auth/failure', to: 'api/v1/sessions#auth_failure'

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

      
      # Google JWT callback route
      post '/auth/google/callback', to: 'sessions#google_callback'
      
      # Facebook access token callback route
      post '/auth/facebook/callback', to: 'sessions#facebook_callback'
      
      # 用戶路由
      get '/users/profile', to: 'users#show'
      put '/users/profile', to: 'users#update'
      put '/users/bank_account', to: 'users#update_bank_account'
      put '/users/change_password', to: 'users#change_password'
      delete '/users/account', to: 'users#delete_account'
      
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
      resources :messages, only: [:index, :show, :create] do
        member do
          post :accept_offer
          post :reject_offer
        end
      end

      # 品牌路由
      resources :brands, only: [:index, :show, :create]
      
      # 型號路由
      resources :bicycle_models, only: [:index, :show, :create]
      
      # 變速系統路由
      resources :transmissions, only: [:index, :show, :create]
      
      # 目錄資料路由
      get '/catalog', to: 'catalog#index'

      # 意見反饋路由
      resources :feedbacks, only: [:index, :show, :create, :update] do
        collection do
          get :categories
        end
      end

      # 安全路由
      namespace :security do
        post '/csp-violations', to: 'security#csp_violations'
        get '/status', to: 'security#status'
        get '/violations/stats', to: 'security#violation_stats'
      end

      # 訂單路由
      resources :orders, only: [:index, :show, :create, :update] do
        member do
          put :complete
          put :cancel
          post :payment_proof  # 添加付款證明上傳路由
          get :payment_proof_file  # 添加付款證明檔案查看路由
        end
        collection do
          get :me # 保持向後兼容
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
            patch :archive
          end
        end
        
        # Admin order management
        resources :orders do
          member do
            patch :approve_sale
            patch :reject_sale
          end
        end
        
        # Admin user management
        resources :users do
          member do
            patch :blacklist
            patch :suspicious
            patch :make_admin
            patch :remove_admin
          end
        end
        
        # Admin message management
        resources :messages, only: [:index] do
          collection do
            get :conversations
          end
        end
        
        # Admin site configuration management
        resources :site_configurations, only: [:index] do
          collection do
            patch :update
            get :bank_info
          end
        end
        
        # Admin feedback management
        resources :feedbacks do
          collection do
            get :stats
          end
          member do
            post :respond
          end
        end
      end
    end
  end
end