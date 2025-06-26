# API controller for admin dashboard
# Provides statistics and overview data for administrators
#
# @author RideCycle Team
# @since 1.0.0
class Api::V1::Admin::DashboardController < ApplicationController
  include BicyclePreloader # 引入共享的預載邏輯

  before_action :authenticate_user!
  before_action :ensure_admin!

  # GET /api/v1/admin/dashboard/stats
  # Returns dashboard statistics for admin overview
  #
  # @api public
  # @example GET /api/v1/admin/dashboard/stats
  # @return [JSON] Dashboard statistics including bicycle counts and user counts
  def stats
    begin
      # 使用單一查詢獲取所有 bicycle 統計資料，避免 N+1 查詢
      bicycle_stats = Bicycle.group(:status).count
      user_stats = User.group(:admin).count
      
      stats_data = {
        pending_bicycles: bicycle_stats['pending'] || 0,
        available_bicycles: bicycle_stats['available'] || 0,
        sold_bicycles: bicycle_stats['sold'] || 0,
        draft_bicycles: bicycle_stats['draft'] || 0,
        total_bicycles: bicycle_stats.values.sum,
        total_users: user_stats.values.sum,
        admin_users: user_stats[true] || 0,
        recent_bicycles: Bicycle.where('created_at >= ?', 7.days.ago).count,
        recent_users: User.where('created_at >= ?', 7.days.ago).count
      }

      # 使用統一的 JSON:API 自定義回應格式
      render_jsonapi_custom(
        type: 'dashboard_stats',
        id: '1',
        attributes: stats_data,
        meta: {
          timestamp: Time.current.iso8601
        }
      )
    rescue StandardError => e
      Rails.logger.error "Admin dashboard stats error: #{e.message}"
              render_jsonapi_errors(['Failed to fetch dashboard statistics'], status: :internal_server_error, title: 'Internal Server Error')
    end
  end

  # GET /api/v1/admin/dashboard/recent_activity
  # Returns recent activity for admin dashboard
  #
  # @api public
  # @example GET /api/v1/admin/dashboard/recent_activity
  # @return [JSON] Recent bicycles and users
  def recent_activity
    begin
      # 使用共享的預載邏輯
      recent_bicycles = Bicycle.includes(standard_bicycle_includes)
                              .order(created_at: :desc)
                              .limit(10)
      
      # 使用 counter_cache 或 joins 來避免 N+1 查詢
      recent_users = User.includes(:bicycles)
                        .order(created_at: :desc)
                        .limit(10)

      # 序列化自行車資料
      serialized_bicycles = BicycleSerializer.new(recent_bicycles).serializable_hash

      # 序列化用戶資料
      serialized_users = recent_users.map do |user|
        {
          type: 'user',
          id: user.id.to_s,
          attributes: {
            name: user.name,
            email: user.email,
            admin: user.admin?,
            created_at: user.created_at.iso8601,
            bicycles_count: user.bicycles.size # 使用 size 避免 N+1
          }
        }
      end

      # 使用統一的 JSON:API 自定義回應格式
      render_jsonapi_custom(
        type: 'recent_activity',
        id: '1',
        attributes: {
          recent_bicycles: serialized_bicycles[:data],
          recent_users: serialized_users
        },
        meta: {
          bicycles_count: recent_bicycles.count,
          users_count: recent_users.count,
          timestamp: Time.current.iso8601
        }
      )
    rescue StandardError => e
      Rails.logger.error "Admin recent activity error: #{e.message}"
              render_jsonapi_errors(['Failed to fetch recent activity'], status: :internal_server_error, title: 'Internal Server Error')
    end
  end

  private

  # Ensures the current user is an admin
  # @raise [ActionController::RoutingError] if user is not an admin
  def ensure_admin!
    unless current_user&.admin?
      render_jsonapi_errors(['Access denied. Admin privileges required.'], status: :forbidden, title: 'Forbidden')
    end
  end
end
