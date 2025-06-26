# frozen_string_literal: true

# API controller for user profile management
# Handles user profile operations including bank account management
#
# @author RideCycle Team
# @since 1.0.0
class Api::V1::UsersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user, only: [:show, :update, :update_bank_account]

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