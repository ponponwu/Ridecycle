# frozen_string_literal: true

# Admin feedback serializer for admin-facing API responses
# Contains full details including user information
#
# @author RideCycle Team
# @since 1.0.0
class AdminFeedbackSerializer < ActiveModel::Serializer
  attributes :id, :subject, :content, :category, :status, :admin_response,
             :created_at, :updated_at, :responded_at,
             :category_name, :status_name, :response_provided,
             :can_be_resolved, :resolved_status

  belongs_to :user, serializer: UserDetailSerializer

  def category_name
    object.category_name
  end

  def status_name
    object.status_name
  end

  def response_provided
    object.response_provided?
  end

  def can_be_resolved
    object.can_be_resolved?
  end

  def resolved_status
    object.resolved?
  end
end