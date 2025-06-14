class BicycleModelSerializer
  include JSONAPI::Serializer
  
  attributes :id, :name, :description, :year, :brand_id, :frame_material, :created_at, :updated_at
  
  belongs_to :brand
end