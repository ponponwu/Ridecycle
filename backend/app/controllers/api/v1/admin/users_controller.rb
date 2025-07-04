# app/controllers/api/v1/admin/users_controller.rb
class Api::V1::Admin::UsersController < ApplicationController
  include JsonApiResponse
  before_action :authenticate_user!
  before_action :ensure_admin!
  before_action :set_user, only: [:show, :blacklist, :suspicious, :make_admin, :remove_admin]

  # GET /api/v1/admin/users
  def index
    # Use includes for efficient loading of associations
    users = User.includes(:bicycles, :sent_messages, :received_messages)
                .order(created_at: :desc)

    # Calculate statistics in Ruby to avoid complex SQL
    total_count = users.count
    admin_count = users.select(&:admin?).count
    blacklisted_count = users.select(&:is_blacklisted).count

    # Use the standard JSON:API collection response
    meta = {
      total_count: total_count,
      admin_count: admin_count,
      blacklisted_count: blacklisted_count
    }

    render_jsonapi_collection(users, serializer: UserSerializer, meta: meta)
  rescue => e
    Rails.logger.error "Error fetching admin users: #{e.message}"
    render_jsonapi_errors(['Failed to fetch users'], status: :internal_server_error)
  end

  # GET /api/v1/admin/users/:id
  def show
    user_data = {
      id: @user.id,
      full_name: @user.full_name,
      name: @user.name,
      email: @user.email,
      avatar_url: @user.avatar_url,
      role: @user.admin? ? 'admin' : 'user',
      created_at: @user.created_at,
      updated_at: @user.updated_at,
      bicycles_count: @user.bicycles.count,
      messages_count: Message.where('sender_id = ? OR receiver_id = ?', @user.id, @user.id).count,
      is_blacklisted: @user.is_blacklisted || false,
      phone_verified: @user.phone_verified || false,
      is_suspicious: @user.is_suspicious || false
    }

    render_jsonapi_resource(@user, serializer: UserSerializer)
  rescue => e
    Rails.logger.error "Error fetching user #{params[:id]}: #{e.message}"
    render_jsonapi_errors(['Failed to fetch user'], status: :internal_server_error)
  end

  # PATCH /api/v1/admin/users/:id/blacklist
  def blacklist
    new_status = !(@user.is_blacklisted || false)
    
    # 使用 update_column 繞過驗證，因為黑名單用戶不需要銀行帳戶驗證
    if @user.update_column(:is_blacklisted, new_status)
      @user.reload # 重新載入用戶數據
      render_jsonapi_custom(
        type: 'user_blacklist_update',
        id: @user.id,
        attributes: {
          is_blacklisted: @user.is_blacklisted,
          message: new_status ? 'User has been blacklisted' : 'User has been unblacklisted'
        }
      )
    else
      render_jsonapi_errors(['Failed to update blacklist status'], status: :unprocessable_entity)
    end
  rescue => e
    Rails.logger.error "Error updating blacklist status for user #{params[:id]}: #{e.message}"
    render_jsonapi_errors(['Failed to update blacklist status'], status: :internal_server_error)
  end

  # PATCH /api/v1/admin/users/:id/suspicious
  def suspicious
    new_status = !(@user.is_suspicious || false)
    
    # 使用 update_column 繞過驗證
    if @user.update_column(:is_suspicious, new_status)
      @user.reload # 重新載入用戶數據
      render_jsonapi_custom(
        type: 'user_suspicious_update',
        id: @user.id,
        attributes: {
          is_suspicious: @user.is_suspicious,
          message: new_status ? 'User has been marked as suspicious' : 'User suspicious mark has been removed'
        }
      )
    else
      render_jsonapi_errors(['Failed to update suspicious status'], status: :unprocessable_entity)
    end
  rescue => e
    Rails.logger.error "Error updating suspicious status for user #{params[:id]}: #{e.message}"
    render_jsonapi_errors(['Failed to update suspicious status'], status: :internal_server_error)
  end

  # PATCH /api/v1/admin/users/:id/make_admin
  def make_admin
    if @user.update(admin: true)
      render_jsonapi_custom(
      type: 'user_admin_update',
      id: @user.id,
      attributes: {
        admin: @user.admin,
        message: 'User has been made admin'
      }
    )
    else
      render_jsonapi_errors(['Failed to make user admin'], status: :unprocessable_entity)
    end
  rescue => e
    Rails.logger.error "Error making user #{params[:id]} admin: #{e.message}"
    render_jsonapi_errors(['Failed to make user admin'], status: :internal_server_error)
  end

  # PATCH /api/v1/admin/users/:id/remove_admin
  def remove_admin
    if @user.update(admin: false)
      render_jsonapi_custom(
      type: 'user_admin_update',
      id: @user.id,
      attributes: {
        admin: @user.admin,
        message: 'Admin privileges have been removed'
      }
    )
    else
      render_jsonapi_errors(['Failed to remove admin privileges'], status: :unprocessable_entity)
    end
  rescue => e
    Rails.logger.error "Error removing admin privileges for user #{params[:id]}: #{e.message}"
    render_jsonapi_errors(['Failed to remove admin privileges'], status: :internal_server_error)
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_jsonapi_errors(['User not found'], status: :not_found)
  end

  def ensure_admin!
    unless current_user&.admin?
      render_jsonapi_errors(['Admin access required'], status: :forbidden)
    end
  end
end