# app/controllers/api/v1/brands_controller.rb
module Api
  module V1
    class BrandsController < ApplicationController
      skip_before_action :authenticate_user!, only: [:index, :show, :create]
      # 展示所有品牌或搜索品牌
      def index
        query = params[:q]&.strip&.downcase
        
        if query.present?
          @brands = Brand.where("LOWER(name) LIKE ?", "%#{query}%").order(:name)
        else
          @brands = Brand.all.order(:name)
        end
        
        render_jsonapi_collection(@brands, serializer: BrandSerializer)
      end
      
      # 獲取單個品牌詳情
      def show
        @brand = Brand.find(params[:id])
        render_jsonapi_resource(@brand, serializer: BrandSerializer)
      rescue ActiveRecord::RecordNotFound
        render_jsonapi_errors(['Brand not found'], status: :not_found, title: 'Not Found')
      end
      
      # 創建新品牌
      def create
        begin
          # 檢查是否已經存在相同名稱的品牌
          normalized_name = brand_params[:name].strip.titleize
          existing_brand = Brand.where("LOWER(name) = ?", normalized_name.downcase).first
          
          if existing_brand
            # 如果已存在，返回現有品牌
            render_jsonapi_resource(existing_brand, serializer: BrandSerializer, status: :ok)
          else
            # 創建新品牌，使用正規化的名稱
            brand_attributes = brand_params.dup
            brand_attributes[:name] = normalized_name
            @brand = Brand.new(brand_attributes)
            
            if @brand.save
              render_jsonapi_resource(@brand, serializer: BrandSerializer, status: :created)
            else
              render_jsonapi_errors(@brand.errors.full_messages)
            end
          end
        rescue ActionController::ParameterMissing => e
          render_jsonapi_errors(['Missing required parameters'], status: :bad_request, title: 'Bad Request')
        end
      end
      
      private
      
      def brand_params
        params.require(:brand).permit(:name, :description, :country)
      end
    end
  end
end