# app/serializers/message_serializer.rb
class MessageSerializer
  include JSONAPI::Serializer

  attributes :id, :content, :created_at, :read_at, :is_offer, :offer_amount, :offer_status

  # 直接提供 sender 和 recipient 資訊，避免 JSON:API 關聯複雜性
  attribute :sender do |object|
    if object.sender
      {
        id: object.sender.id.to_s,
        name: object.sender.name,
        email: object.sender.email,
        avatar_url: object.sender.avatar_url
      }
    else
      nil
    end
  end

  attribute :recipient do |object|
    if object.recipient
      {
        id: object.recipient.id.to_s,
        name: object.recipient.name,
        email: object.recipient.email,
        avatar_url: object.recipient.avatar_url
      }
    else
      nil
    end
  end

  attribute :bicycle do |object|
    if object.bicycle
      {
        id: object.bicycle.id.to_s,
        title: object.bicycle.title,
        price: object.bicycle.price
      }
    else
      nil
    end
  end

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