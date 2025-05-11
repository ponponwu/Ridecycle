# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # 認證路由
      post '/register', to: 'auth#register'
      post '/login', to: 'auth#login'
      get '/me', to: 'auth#me'
      post '/logout', to: 'auth#logout' # Changed to POST to match frontend call
      
      # 自行車路由
      resources :bicycles do
        resources :images, only: [:create, :destroy]
      end
      
      # 訊息路由
      resources :messages, only: [:index, :show, :create]
    end
  end
end