# frozen_string_literal: true

# Feedbacks API controller for user feedback management
# Handles feedback submission and user's own feedback viewing
#
# @author RideCycle Team
# @since 1.0.0
class Api::V1::FeedbacksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_feedback, only: [:show, :update]
  before_action :ensure_owner, only: [:show, :update]

  # GET /api/v1/feedbacks
  # Get current user's feedbacks with pagination
  def index
    @feedbacks = current_user.feedbacks
                            .includes(:user)
                            .recent
                            .page(params[:page])
                            .per(params[:per_page] || 10)

    @feedbacks = @feedbacks.by_category(params[:category]) if params[:category].present?
    @feedbacks = @feedbacks.by_status(params[:status]) if params[:status].present?

    render json: {
      feedbacks: ActiveModelSerializers::SerializableResource.new(
        @feedbacks,
        each_serializer: FeedbackSerializer
      ).as_json,
      pagination: {
        current_page: @feedbacks.current_page,
        total_pages: @feedbacks.total_pages,
        total_count: @feedbacks.total_count,
        per_page: @feedbacks.limit_value
      }
    }, status: :ok
  end

  # GET /api/v1/feedbacks/:id
  # Get specific feedback (user can only see their own)
  def show
    render json: {
      feedback: FeedbackSerializer.new(@feedback).as_json
    }, status: :ok
  end

  # POST /api/v1/feedbacks
  # Create new feedback
  def create
    @feedback = current_user.feedbacks.build(feedback_params)

    if @feedback.save
      render json: {
        message: I18n.t('feedback.created_successfully'),
        feedback: FeedbackSerializer.new(@feedback).as_json
      }, status: :created
    else
      render json: {
        message: I18n.t('feedback.creation_failed'),
        errors: @feedback.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/feedbacks/:id
  # Update feedback (only content and subject can be updated, and only if not responded)
  def update
    if @feedback.response_provided?
      render json: {
        message: I18n.t('feedback.cannot_edit_responded')
      }, status: :unprocessable_entity and return
    end

    if @feedback.update(feedback_update_params)
      render json: {
        message: I18n.t('feedback.updated_successfully'),
        feedback: FeedbackSerializer.new(@feedback).as_json
      }, status: :ok
    else
      render json: {
        message: I18n.t('feedback.update_failed'),
        errors: @feedback.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/feedbacks/categories
  # Get available feedback categories
  def categories
    render json: {
      categories: Feedback.categories_for_select.map { |name, key|
        { key: key, name: name }
      }
    }, status: :ok
  end

  private

  def set_feedback
    @feedback = current_user.feedbacks.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      message: I18n.t('feedback.not_found')
    }, status: :not_found
  end

  def ensure_owner
    unless @feedback.user == current_user
      render json: {
        message: I18n.t('unauthorized')
      }, status: :forbidden
    end
  end

  def feedback_params
    params.require(:feedback).permit(:subject, :content, :category)
  end

  def feedback_update_params
    params.require(:feedback).permit(:subject, :content)
  end
end