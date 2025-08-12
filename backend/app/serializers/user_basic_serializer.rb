# frozen_string_literal: true

# Basic user serializer for minimal user information
# Used in feedback responses to avoid exposing sensitive data
#
# @author RideCycle Team
# @since 1.0.0
class UserBasicSerializer < ActiveModel::Serializer
  attributes :id, :username, :email

  def email
    # Only show partial email for privacy
    return nil unless object.email.present?
    
    email_parts = object.email.split('@')
    return object.email if email_parts.length != 2
    
    username_part = email_parts[0]
    domain_part = email_parts[1]
    
    if username_part.length <= 2
      "#{username_part}***@#{domain_part}"
    else
      "#{username_part[0..1]}***@#{domain_part}"
    end
  end
end