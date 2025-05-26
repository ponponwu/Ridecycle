class BrandSerializer
  include JSONAPI::Serializer
  
  attributes :id, :name, :created_at, :updated_at

  attribute :name do |object|
    object.name
  end

end