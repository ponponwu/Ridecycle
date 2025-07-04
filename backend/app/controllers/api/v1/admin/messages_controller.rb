# app/controllers/api/v1/admin/messages_controller.rb
class Api::V1::Admin::MessagesController < ApplicationController
  include JsonApiResponse
  before_action :authenticate_user!
  before_action :ensure_admin!

  # GET /api/v1/admin/messages
  def index
    messages = Message.includes(:sender, :recipient, :bicycle)
                     .order(created_at: :desc)
                     .limit(params[:limit]&.to_i || 100)

    render_jsonapi_collection(messages, serializer: MessageSerializer)
  rescue => e
    Rails.logger.error "Error fetching admin messages: #{e.message}"
    render_jsonapi_errors(['Failed to fetch messages'], status: :internal_server_error)
  end

  # GET /api/v1/admin/messages/conversations
  def conversations
    bicycle_id = params[:bicycle_id]
    sender_id = params[:sender_id]
    receiver_id = params[:receiver_id]

    if bicycle_id.blank? || sender_id.blank? || receiver_id.blank?
      return render_jsonapi_errors(['bicycle_id, sender_id, and receiver_id are required'], status: :bad_request)
    end

    # Fetch all messages between these users for this bicycle
    messages = Message.includes(:sender, :recipient, :bicycle)
                     .where(bicycle_id: bicycle_id)
                     .where(
                       '(sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)',
                       sender_id, receiver_id, receiver_id, sender_id
                     )
                     .order(created_at: :asc)

    meta = {
      conversation_id: "#{bicycle_id}_#{[sender_id, receiver_id].sort.join('_')}",
      bicycle_id: bicycle_id,
      participants: [sender_id, receiver_id],
      message_count: messages.count,
      timestamp: Time.current.iso8601
    }

    render_jsonapi_collection(messages, serializer: MessageSerializer, meta: meta)
  rescue => e
    Rails.logger.error "Error fetching conversation: #{e.message}"
    render_jsonapi_errors(['Failed to fetch conversation'], status: :internal_server_error)
  end

  private

  def ensure_admin!
    unless current_user&.admin?
      render_jsonapi_errors(['Admin access required'], status: :forbidden)
    end
  end
end