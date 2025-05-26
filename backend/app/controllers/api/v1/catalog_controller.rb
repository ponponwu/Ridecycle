module Api
  module V1
    class CatalogController < ApplicationController
      # GET /api/v1/catalog
      def index
        brands = Brand.includes(:bicycle_models).ordered
        transmissions = Transmission.ordered
        
        render json: {
          brands: BrandSerializer.new(brands).serializable_hash,
          # brands: ActiveModelSerializers::SerializableResource.new(brands, each_serializer: BrandSerializer).as_json,
          transmissions: TransmissionSerializer.new(transmissions).serializable_hash,
          # transmissions: ActiveModelSerializers::SerializableResource.new(transmissions, each_serializer: TransmissionSerializer).as_json
        }
      end
    end
  end
end 