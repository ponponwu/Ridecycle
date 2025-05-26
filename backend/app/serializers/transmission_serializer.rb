class TransmissionSerializer
  include JSONAPI::Serializer
  attributes :id, :name

  attribute :name do |object|
    object.name
  end
end 