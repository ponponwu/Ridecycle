# app/controllers/api/v1/bicycle_models_controller.rb
module Api
  module V1
    class BicycleModelsController < ApplicationController
      skip_before_action :authenticate_user!, only: [:index, :show, :create]
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
        
        render_jsonapi_collection(@models, serializer: BicycleModelSerializer)
      end
      
      # 獲取單個型號詳情
      def show
        @model = BicycleModel.find(params[:id])
        render_jsonapi_resource(@model, serializer: BicycleModelSerializer)
      rescue ActiveRecord::RecordNotFound
        render_jsonapi_errors(['Bicycle model not found'], status: :not_found, title: 'Not Found')
      end
      
      # 創建新型號
      def create
        begin
          # 檢查是否已經存在相同的品牌和名稱組合
          model_params = bicycle_model_params
          normalized_name = model_params[:name].strip.titleize
          existing_model = BicycleModel.where(
            brand_id: model_params[:brand_id],
            name: normalized_name
          ).first
          
          if existing_model
            # 如果已存在，返回現有型號
            render_jsonapi_resource(existing_model, serializer: BicycleModelSerializer, status: :ok)
          else
            # 創建新型號，使用正規化的名稱
            @model = BicycleModel.new(model_params.merge(name: normalized_name))
            
            if @model.save
              render_jsonapi_resource(@model, serializer: BicycleModelSerializer, status: :created)
            else
              render_jsonapi_errors(@model.errors.full_messages)
            end
          end
        rescue ActionController::ParameterMissing => e
          render_jsonapi_errors(['Missing required parameters'], status: :bad_request, title: 'Bad Request')
        end
      end
      
      private
      
      def bicycle_model_params
        params.require(:bicycle_model).permit(:name, :description, :year, :brand_id, :frame_material)
      end
    end
  end
end