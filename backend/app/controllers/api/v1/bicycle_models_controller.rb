# app/controllers/api/v1/bicycle_models_controller.rb
module Api
  module V1
    class BicycleModelsController < ApplicationController
      # 列出特定品牌的所有型號或搜索型號
      def index
        brand_id = params[:brand_id]
        query = params[:q]&.strip&.downcase
        
        @models = BicycleModel.all
        
        # 如果提供了品牌 ID，過濾該品牌的型號
        @models = @models.where(brand_id: brand_id) if brand_id.present?
        
        # 如果提供了搜索查詢，過濾匹配的型號
        @models = @models.where("LOWER(name) LIKE ?", "%#{query}%") if query.present?
        
        # 按名稱排序
        @models = @models.order(:name)
        
        render json: BicycleModelSerializer.new(@models).serializable_hash
      end
      
      # 獲取單個型號詳情
      def show
        @model = BicycleModel.find(params[:id])
        render json: BicycleModelSerializer.new(@model).serializable_hash
      end
      
      # 創建新型號
      def create
        # 檢查是否已經存在相同的品牌和名稱組合
        normalized_name = bicycle_model_params[:name].strip.titleize
        existing_model = BicycleModel.where(
          brand_id: bicycle_model_params[:brand_id],
          name: normalized_name
        ).first
        
        if existing_model
          # 如果已存在，返回現有型號
          render json: BicycleModelSerializer.new(existing_model).serializable_hash, status: :ok
        else
          # 創建新型號
          @model = BicycleModel.new(bicycle_model_params)
          
          if @model.save
            render json: BicycleModelSerializer.new(@model).serializable_hash, status: :created
          else
            render json: { errors: @model.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end
      
      private
      
      def bicycle_model_params
        params.require(:bicycle_model).permit(:name, :description, :year, :brand_id, specifications: {})
      end
    end
  end
end