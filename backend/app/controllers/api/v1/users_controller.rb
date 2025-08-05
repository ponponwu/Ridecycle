# frozen_string_literal: true

# API controller for user profile management
# Handles user profile operations including bank account management
#
# @author RideCycle Team
# @since 1.0.0
class Api::V1::UsersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user, only: [:show, :update, :update_bank_account, :change_password, :delete_account]
  skip_before_action :verify_authenticity_token, only: [:change_password, :delete_account]

  # Gets current user's profile including bank account information
  # 
  # @api public
  # @example GET /api/v1/users/profile
  # @return [JSON] User profile with bank account info in JSON:API format
  def show
    render_jsonapi_resource(@user, serializer: UserSerializer)
  end

  # Updates current user's profile information
  # 
  # @api public
  # @example PUT /api/v1/users/profile
  # @param [Hash] user The user parameters
  # @option user [String] :name The user's name
  # @option user [String] :email The user's email
  # @return [JSON] Updated user profile in JSON:API format
  # @return [JSON] Error messages if validation fails
  def update
    if @user.update(user_params)
      render_jsonapi_resource(@user, serializer: UserSerializer)
    else
      render_jsonapi_errors(@user.errors.full_messages)
    end
  end

  # Updates current user's bank account information
  # 
  # @api public
  # @example PUT /api/v1/users/bank_account
  # @param [Hash] bank_account The bank account parameters
  # @option bank_account [String] :bank_account_name Account holder name
  # @option bank_account [String] :bank_account_number Account number
  # @option bank_account [String] :bank_code Bank code (3 digits)
  # @option bank_account [String] :bank_branch Branch name
  # @return [JSON] Success message with updated bank account info
  # @return [JSON] Error messages if validation fails
  def update_bank_account
    # 驗證必要參數
    validation_errors = validate_bank_account_params(bank_account_params)
    
    if validation_errors.any?
      render_jsonapi_errors(validation_errors, 
                           title: I18n.t('bank_account.update_failed', default: '銀行帳戶更新失敗'))
      return
    end

    if @user.update_bank_account(bank_account_params)
      render_jsonapi_custom(
        type: 'bank_account_update',
        id: @user.id,
        attributes: {
          bank_account: @user.bank_account_info_unmasked,
          message: I18n.t('bank_account.update_success', default: '銀行帳戶更新成功')
        }
      )
    else
      render_jsonapi_errors(@user.errors.full_messages, 
                           title: I18n.t('bank_account.update_failed', default: '銀行帳戶更新失敗'))
    end
  end

  # Changes current user's password
  # 
  # @api public
  # @example PUT /api/v1/users/change_password
  # @param [Hash] password_change The password change parameters
  # @option password_change [String] :current_password Current password
  # @option password_change [String] :new_password New password
  # @option password_change [String] :new_password_confirmation New password confirmation
  # @return [JSON] Success message if password changed
  # @return [JSON] Error messages if validation fails
  def change_password
    current_password = password_change_params[:current_password]
    new_password = password_change_params[:new_password]
    new_password_confirmation = password_change_params[:new_password_confirmation]

    # OAuth 用戶首次設置密碼時跳過當前密碼驗證
    if @user.needs_password_setup?
      Rails.logger.info "OAuth user setting up password for the first time"
    else
      # 一般用戶需要驗證當前密碼
      unless @user.authenticate(current_password)
        render_jsonapi_errors(['目前密碼不正確'], 
                             title: I18n.t('password.change_failed', default: '密碼更改失敗'))
        return
      end
    end

    # 驗證新密碼
    if new_password.blank?
      render_jsonapi_errors(['新密碼不能為空'], 
                           title: I18n.t('password.change_failed', default: '密碼更改失敗'))
      return
    end

    if new_password.length < 6
      render_jsonapi_errors(['新密碼必須至少6個字符'], 
                           title: I18n.t('password.change_failed', default: '密碼更改失敗'))
      return
    end

    if new_password != new_password_confirmation
      render_jsonapi_errors(['新密碼確認不匹配'], 
                           title: I18n.t('password.change_failed', default: '密碼更改失敗'))
      return
    end

    # 更新密碼
    if @user.update(password: new_password, password_confirmation: new_password_confirmation)
      # 標記 OAuth 用戶已手動設置密碼
      @user.mark_password_as_manually_set! if @user.oauth_user?
      
      render_jsonapi_custom(
        type: 'password_change',
        id: @user.id,
        attributes: {
          message: I18n.t('password.change_success', default: '密碼更改成功')
        }
      )
    else
      render_jsonapi_errors(@user.errors.full_messages, 
                           title: I18n.t('password.change_failed', default: '密碼更改失敗'))
    end
  end

  # Deletes current user's account
  # 
  # @api public
  # @example DELETE /api/v1/users/account
  # @param [Hash] account_deletion The account deletion parameters
  # @option account_deletion [String] :password Current password for confirmation
  # @option account_deletion [String] :confirmation Confirmation text ("DELETE")
  # @return [JSON] Success message if account deleted
  # @return [JSON] Error messages if validation fails
  def delete_account
    password = account_deletion_params[:password]
    confirmation = account_deletion_params[:confirmation]

    # 驗證密碼
    unless @user.authenticate(password)
      render_jsonapi_errors(['密碼不正確'], 
                           title: I18n.t('account.delete_failed', default: '帳號刪除失敗'))
      return
    end

    # 驗證確認文字
    unless confirmation == 'DELETE'
      render_jsonapi_errors(['請輸入 "DELETE" 以確認刪除'], 
                           title: I18n.t('account.delete_failed', default: '帳號刪除失敗'))
      return
    end

    begin
      # 先刪除相關數據
      @user.bicycles.destroy_all
      @user.sent_messages.destroy_all
      @user.received_messages.destroy_all
      @user.orders.destroy_all
      @user.refresh_tokens.destroy_all
      
      # 刪除用戶
      @user.destroy!

      render_jsonapi_custom(
        type: 'account_deletion',
        id: @user.id,
        attributes: {
          message: I18n.t('account.delete_success', default: '帳號已成功刪除')
        }
      )
    rescue => e
      Rails.logger.error "Account deletion failed: #{e.message}"
      render_jsonapi_errors(['帳號刪除過程中發生錯誤'], 
                           title: I18n.t('account.delete_failed', default: '帳號刪除失敗'))
    end
  end

  private

  def set_user
    @user = current_user
  end

  def user_params
    params.require(:user).permit(:name, :email)
  end

  def bank_account_params
    params.require(:bank_account).permit(
      :bank_account_name,
      :bank_account_number,
      :bank_code,
      :bank_branch
    )
  end

  def password_change_params
    # Handle both nested and flat parameter structures
    if params[:password_change].present?
      params.require(:password_change).permit(
        :current_password,
        :new_password,
        :new_password_confirmation
      )
    else
      # Fallback to direct params if not nested
      params.permit(
        :current_password,
        :new_password,
        :new_password_confirmation
      )
    end
  rescue ActionController::ParameterMissing => e
    Rails.logger.warn "Password change parameter missing: #{e.message}"
    {}
  end

  def account_deletion_params
    params.require(:account_deletion).permit(
      :password,
      :confirmation
    )
  end

  # 自定義銀行帳戶參數驗證
  def validate_bank_account_params(params)
    errors = []
    
    errors << '銀行戶名不能為空' if params[:bank_account_name].blank?
    errors << '銀行帳號不能為空' if params[:bank_account_number].blank?
    errors << '銀行代碼不能為空' if params[:bank_code].blank?
    errors << '分行名稱不能為空' if params[:bank_branch].blank?
    
    if params[:bank_account_number].present? && !params[:bank_account_number].match(/\A[\d\-]+\z/)
      errors << '銀行帳號只能包含數字和連字符'
    end
    
    if params[:bank_code].present? && !params[:bank_code].match(/\A\d{3}\z/)
      errors << '銀行代碼必須為3位數字'
    end
    
    errors
  end
end 