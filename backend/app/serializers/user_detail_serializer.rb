# frozen_string_literal: true

# Detailed user serializer for admin-facing responses
# Contains full user information for admin management
#
# @author RideCycle Team
# @since 1.0.0
class UserDetailSerializer < ActiveModel::Serializer
  attributes :id, :username, :email, :created_at, :last_sign_in_at, 
             :phone, :is_admin, :account_status

  def account_status
    return 'active' if object.confirmed_at.present?
    return 'pending_confirmation'
  end

  def is_admin
    object.admin?
  end
end