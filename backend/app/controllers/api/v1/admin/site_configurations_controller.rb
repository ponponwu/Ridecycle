# app/controllers/api/v1/admin/site_configurations_controller.rb
class Api::V1::Admin::SiteConfigurationsController < ApplicationController
  include JsonApiResponse
  before_action :authenticate_user!
  before_action :ensure_admin!

  # GET /api/v1/admin/site_configurations
  def index
    settings = SiteConfiguration.all_settings

    render_jsonapi_custom(
      type: 'site_configuration',
      id: 'settings',
      attributes: settings
    )
  rescue => e
    Rails.logger.error "Error fetching site configurations: #{e.message}"
    render_jsonapi_errors(['Failed to fetch site configurations'], status: :internal_server_error)
  end

  # PATCH /api/v1/admin/site_configurations
  def update
    settings_params = params.require(:settings).permit(
      :site_name,
      :contact_email,
      :bank_name,
      :bank_code,
      :account_number,
      :account_name,
      :bank_branch,
      :enable_registration,
      :require_verification,
      :bicycle_approval_required
    )

    # 更新設定
    settings_params.each do |key, value|
      SiteConfiguration.set_setting(key, value)
    end

    # 返回更新後的設定
    updated_settings = SiteConfiguration.all_settings

    render_jsonapi_custom(
      type: 'site_configuration',
      id: 'settings',
      attributes: updated_settings,
      meta: { message: 'Settings updated successfully' }
    )
  rescue => e
    Rails.logger.error "Error updating site configurations: #{e.message}"
    render_jsonapi_errors(['Failed to update site configurations'], status: :internal_server_error)
  end

  # GET /api/v1/admin/site_configurations/bank_info
  def bank_info
    bank_settings = {
      bank_name: SiteConfiguration.get_setting('bank_name', '玉山銀行'),
      bank_code: SiteConfiguration.get_setting('bank_code', '808'),
      account_number: SiteConfiguration.get_setting('account_number', '1234567890123'),
      account_name: SiteConfiguration.get_setting('account_name', 'RideCycle 有限公司'),
      branch: SiteConfiguration.get_setting('bank_branch', '台北分行')
    }

    render_jsonapi_custom(
      type: 'bank_info',
      id: 'current',
      attributes: bank_settings
    )
  rescue => e
    Rails.logger.error "Error fetching bank info: #{e.message}"
    render_jsonapi_errors(['Failed to fetch bank info'], status: :internal_server_error)
  end

  private

  def ensure_admin!
    unless current_user&.admin?
      render_jsonapi_errors(['Admin access required'], status: :forbidden)
    end
  end
end