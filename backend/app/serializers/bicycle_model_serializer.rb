class BicycleModelSerializer
  include JSONAPI::Serializer
  
  attributes :id, :name, :description, :year, :specifications, :created_at, :updated_at
  
  belongs_to :brand
end