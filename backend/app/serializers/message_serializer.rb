class MessageSerializer
  include JSONAPI::Serializer
  
  attributes :id, :content, :read_at, :created_at, :updated_at
  
  # 統一的關聯物件
  attribute :bicycle do |object|
    if object.bicycle
      {
        id: object.bicycle.id,
        title: object.bicycle.title,
        price: object.bicycle.price.to_f,
        status: object.bicycle.status
      }
    end
  end

  attribute :sender do |object|
    if object.sender
      {
        id: object.sender.id,
        name: object.sender.name,
        full_name: object.sender.full_name,
        email: object.sender.email,
        avatar_url: object.sender.avatar_url
      }
    end
  end

  attribute :recipient do |object|
    if object.recipient
      {
        id: object.recipient.id,
        name: object.recipient.name,
        full_name: object.recipient.full_name,
        email: object.recipient.email,
        avatar_url: object.recipient.avatar_url
      }
    end
  end
  
  # 如果有附件
  # attribute :attachments_urls do |object|
  #   if object.respond_to?(:attachments) && object.attachments.attached?
  #     object.attachments.map do |attachment|
  #       begin
  #         Rails.application.routes.url_helpers.rails_blob_url(attachment, only_path: false)
  #       rescue NoMethodError
  #         Rails.logger.error "MessageSerializer: Failed to generate attachment_url. Ensure default_url_options[:host] is set."
  #         nil
  #       rescue StandardError => e
  #         Rails.logger.error "MessageSerializer: Error generating attachment_url for attachment ##{attachment.id}: #{e.message}"
  #         nil
  #       end
  #     end.compact
  #   else
  #     []
  #   end
  # end
end 