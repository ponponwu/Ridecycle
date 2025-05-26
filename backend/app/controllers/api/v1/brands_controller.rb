# app/controllers/api/v1/brands_controller.rb
module Api
  module V1
    class BrandsController < ApplicationController
      # 展示所有品牌或搜索品牌
      def index
        query = params[:q]&.strip&.downcase
        
        if query.present?
          @brands = Brand.where("LOWER(name) LIKE ?", "%#{query}%").order(:name)
        else
          @brands = Brand.all.order(:name)
        end
        
        render json: BrandSerializer.new(@brands).serializable_hash
      end
      
      # 獲取單個品牌詳情
      def show
        @brand = Brand.find(params[:id])
        render json: BrandSerializer.new(@brand).serializable_hash
      end
      
      # 創建新品牌
      def create
        # 檢查是否已經存在相同名稱的品牌
        normalized_name = brand_params[:name].strip.titleize
        existing_brand = Brand.where("LOWER(name) = ?", normalized_name.downcase).first
        
        if existing_brand
          # 如果已存在，返回現有品牌
          render json: BrandSerializer.new(existing_brand).serializable_hash, status: :ok
        else
          # 創建新品牌
          @brand = Brand.new(brand_params)
          
          if @brand.save
            render json: BrandSerializer.new(@brand).serializable_hash, status: :created
          else
            render json: { errors: @brand.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end
      
      private
      
      def brand_params
        params.require(:brand).permit(:name, :description, :country)
      end
    end
  end
end