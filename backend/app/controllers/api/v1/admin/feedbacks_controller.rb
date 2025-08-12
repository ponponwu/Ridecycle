# frozen_string_literal: true

# Admin Feedbacks API controller for feedback management
# Handles admin viewing and responding to user feedback
#
# @author RideCycle Team
# @since 1.0.0
class Api::V1::Admin::FeedbacksController < Api::V1::Admin::BaseController
  before_action :set_feedback, only: [:show, :update, :destroy]

  # GET /api/v1/admin/feedbacks
  # Get all feedbacks with pagination and filtering
  def index
    @feedbacks = Feedback.includes(:user)
                        .recent
                        .page(params[:page])
                        .per(params[:per_page] || 20)

    @feedbacks = @feedbacks.by_category(params[:category]) if params[:category].present?
    @feedbacks = @feedbacks.by_status(params[:status]) if params[:status].present?
    @feedbacks = @feedbacks.unresolved if params[:unresolved] == 'true'

    # Search by subject or user email
    if params[:search].present?
      search_term = "%#{params[:search]}%"
      @feedbacks = @feedbacks.joins(:user).where(
        'feedbacks.subject ILIKE ? OR users.email ILIKE ?',
        search_term, search_term
      )
    end

    render json: {
      feedbacks: ActiveModelSerializers::SerializableResource.new(
        @feedbacks,
        each_serializer: AdminFeedbackSerializer
      ).as_json,
      pagination: {
        current_page: @feedbacks.current_page,
        total_pages: @feedbacks.total_pages,
        total_count: @feedbacks.total_count,
        per_page: @feedbacks.limit_value
      },
      stats: {
        total: Feedback.count,
        pending: Feedback.pending.count,
        in_progress: Feedback.in_progress.count,
        resolved: Feedback.resolved.count,
        closed: Feedback.closed.count,
        unresolved: Feedback.unresolved.count
      }
    }, status: :ok
  end

  # GET /api/v1/admin/feedbacks/:id
  # Get specific feedback with full details
  def show
    render json: {
      feedback: AdminFeedbackSerializer.new(@feedback).as_json
    }, status: :ok
  end

  # PATCH/PUT /api/v1/admin/feedbacks/:id
  # Update feedback status and/or add admin response
  def update
    if @feedback.update(admin_feedback_params)
      render json: {
        message: I18n.t('feedback.admin.updated_successfully'),
        feedback: AdminFeedbackSerializer.new(@feedback).as_json
      }, status: :ok
    else
      render json: {
        message: I18n.t('feedback.admin.update_failed'),
        errors: @feedback.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/admin/feedbacks/:id
  # Delete feedback (admin only)
  def destroy
    if @feedback.destroy
      render json: {
        message: I18n.t('feedback.admin.deleted_successfully')
      }, status: :ok
    else
      render json: {
        message: I18n.t('feedback.admin.deletion_failed'),
        errors: @feedback.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/admin/feedbacks/stats
  # Get feedback statistics
  def stats
    render json: {
      total: Feedback.count,
      by_status: {
        pending: Feedback.pending.count,
        in_progress: Feedback.in_progress.count,
        resolved: Feedback.resolved.count,
        closed: Feedback.closed.count
      },
      by_category: Feedback.group(:category).count.transform_keys { |k|
        Feedback.categories.key(k)
      },
      recent: {
        today: Feedback.where(created_at: Date.current.beginning_of_day..Date.current.end_of_day).count,
        this_week: Feedback.where(created_at: Date.current.beginning_of_week..Date.current.end_of_week).count,
        this_month: Feedback.where(created_at: Date.current.beginning_of_month..Date.current.end_of_month).count
      },
      response_time: {
        avg_hours: calculate_average_response_time
      }
    }, status: :ok
  end

  # POST /api/v1/admin/feedbacks/:id/respond
  # Quick respond to feedback
  def respond
    @feedback = Feedback.find(params[:id])
    
    if @feedback.update(
      admin_response: params[:response],
      responded_at: Time.current,
      status: :in_progress
    )
      render json: {
        message: I18n.t('feedback.admin.response_sent'),
        feedback: AdminFeedbackSerializer.new(@feedback).as_json
      }, status: :ok
    else
      render json: {
        message: I18n.t('feedback.admin.response_failed'),
        errors: @feedback.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  private

  def set_feedback
    @feedback = Feedback.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      message: I18n.t('feedback.not_found')
    }, status: :not_found
  end

  def admin_feedback_params
    params.require(:feedback).permit(:status, :admin_response, :responded_at)
  end

  def calculate_average_response_time
    responded_feedbacks = Feedback.where.not(responded_at: nil)
    return 0 if responded_feedbacks.empty?

    total_hours = responded_feedbacks.sum { |feedback|
      ((feedback.responded_at - feedback.created_at) / 1.hour).round(2)
    }

    (total_hours / responded_feedbacks.count).round(2)
  end
end