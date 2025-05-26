module Api
  module V1
    class TransmissionsController < ApplicationController
      before_action :set_transmission, only: [:show, :update, :destroy]
      
      # GET /api/v1/transmissions
      def index
        @transmissions = Transmission.ordered.search(params[:search])
                                   
        
        render json: {
          transmissions: ActiveModel::Serializer::CollectionSerializer.new(
            @transmissions, 
            serializer: TransmissionSerializer
          ),
          total: @transmissions.total_count # 確保您的分頁庫支持 total_count 或類似方法
        }
      end
      
      # GET /api/v1/transmissions/:id
      def show
        render json: @transmission, serializer: TransmissionSerializer
      end
      
      # POST /api/v1/transmissions
      def create
        @transmission = Transmission.new(transmission_params)
        
        if @transmission.save
          render json: @transmission, serializer: TransmissionSerializer, status: :created
        else
          render json: { errors: @transmission.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      # PUT /api/v1/transmissions/:id
      def update
        if @transmission.update(transmission_params)
          render json: @transmission, serializer: TransmissionSerializer
        else
          render json: { errors: @transmission.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      private
      
      def set_transmission
        @transmission = Transmission.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Transmission not found' }, status: :not_found
      end
      
      def transmission_params
        params.require(:transmission).permit(:name)
      end
    end
  end
end 