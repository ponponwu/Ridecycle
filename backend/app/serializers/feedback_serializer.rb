# frozen_string_literal: true

# Feedback serializer for user-facing API responses
#
# @author RideCycle Team
# @since 1.0.0
class FeedbackSerializer < ActiveModel::Serializer
  attributes :id, :subject, :content, :category, :status, :admin_response,
             :created_at, :updated_at, :responded_at,
             :category_name, :status_name, :response_provided

  belongs_to :user, serializer: UserBasicSerializer

  def category_name
    object.category_name
  end

  def status_name
    object.status_name
  end

  def response_provided
    object.response_provided?
  end
end