# frozen_string_literal: true

# Feedback model for storing customer feedback and support requests
# 
# @author RideCycle Team
# @since 1.0.0
class Feedback < ApplicationRecord
  belongs_to :user

  # Validations
  validates :subject, presence: true, length: { maximum: 200 }
  validates :content, presence: true, length: { maximum: 2000 }
  validates :category, presence: true
  validates :status, presence: true

  # Enums for category and status
  enum category: {
    bug_report: 0,
    feature_request: 1,
    general_inquiry: 2,
    account_issue: 3,
    payment_issue: 4,
    bicycle_listing: 5,
    safety_concern: 6,
    other: 7
  }

  enum status: {
    pending: 0,
    in_progress: 1,
    resolved: 2,
    closed: 3
  }

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_category, ->(cat) { where(category: cat) if cat.present? }
  scope :by_status, ->(stat) { where(status: stat) if stat.present? }
  scope :unresolved, -> { where.not(status: [:resolved, :closed]) }

  # Class methods
  def self.categories_for_select
    categories.keys.map { |key| [I18n.t("feedback.categories.#{key}", default: key.humanize), key] }
  end

  def self.statuses_for_select
    statuses.keys.map { |key| [I18n.t("feedback.statuses.#{key}", default: key.humanize), key] }
  end

  # Instance methods
  def category_name
    I18n.t("feedback.categories.#{category}", default: category.humanize)
  end

  def status_name
    I18n.t("feedback.statuses.#{status}", default: status.humanize)
  end

  def resolved?
    status == 'resolved' || status == 'closed'
  end

  def can_be_resolved?
    pending? || in_progress?
  end

  def response_provided?
    admin_response.present?
  end

  # Auto-set status to in_progress when admin responds
  before_save :update_status_on_response

  private

  def update_status_on_response
    if admin_response_changed? && admin_response.present? && pending?
      self.status = :in_progress
    end
  end
end