# app/serializers/message_serializer.rb
class MessageSerializer
  include JSONAPI::Serializer

  attributes :id, :content, :created_at, :read_at, :is_offer, :offer_amount, :offer_status

  belongs_to :sender, serializer: :user, record_type: :user
  belongs_to :recipient, serializer: :user, record_type: :user
  belongs_to :bicycle, serializer: :bicycle, record_type: :bicycle

  attribute :sender_id do |object|
    object.sender_id.to_s
  end

  attribute :recipient_id do |object|
    object.recipient_id.to_s
  end
  
  # Add receiver_id as an alias for backward compatibility
  attribute :receiver_id do |object|
    object.recipient_id.to_s
  end

  attribute :bicycle_id do |object|
    object.bicycle_id.to_s
  end

  # Add sender and recipient names for admin interface
  attribute :sender_name do |object|
    object.sender&.name
  end

  attribute :recipient_name do |object|
    object.recipient&.name
  end
end