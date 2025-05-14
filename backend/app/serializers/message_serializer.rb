class MessageSerializer
  include JSONAPI::Serializer
  
  attributes :id, :content, :read, :created_at, :updated_at
  
  # 訊息相關聯的自行車
  belongs_to :bicycle
  
  # 寄件人
  belongs_to :sender, serializer: :user do |object|
    object.sender
  end
  
  # 收件人
  belongs_to :recipient, serializer: :user do |object|
    object.recipient
  end
  
  # 如果有附件
  attribute :attachments_urls do |object|
    if object.respond_to?(:attachments) && object.attachments.attached?
      object.attachments.map do |attachment|
        begin
          Rails.application.routes.url_helpers.rails_blob_url(attachment, only_path: false)
        rescue NoMethodError
          Rails.logger.error "MessageSerializer: Failed to generate attachment_url. Ensure default_url_options[:host] is set."
          nil
        rescue StandardError => e
          Rails.logger.error "MessageSerializer: Error generating attachment_url for attachment ##{attachment.id}: #{e.message}"
          nil
        end
      end.compact
    else
      []
    end
  end
end 