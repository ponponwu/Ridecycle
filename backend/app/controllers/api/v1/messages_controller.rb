module Api
  module V1
    class MessagesController < ApplicationController
      before_action :authenticate_user!, only: [:index, :show, :create] # Added create
      # before_action :set_conversation, only: [:show] # If :id in show refers to a conversation

      # GET /api/v1/messages
      # Fetches a list of conversations for the current user
      def index
        # This query needs to be more sophisticated to get conversations.
        # A conversation involves two users. We need to find all messages
        # where the current user is either a sender or receiver, group them by
        # the other participant, and then get the latest message for each group.

        # For simplicity, let's assume a Conversation model exists that links two users
        # and has_many messages. If not, the query is more complex.
        # conversations = Conversation.participating(@current_user).includes(:messages, :participants)

        # Simplified: Get all messages sent or received by the current user,
        # then group them by the other user involved. This is not ideal for a "conversation list".
        # A proper Conversation model would be better.

        # Placeholder: This will just fetch all messages involving the current user, not grouped into conversations.
        # This needs to be adapted based on the actual data model for conversations.
        # For now, let's assume we want to list distinct users the current user has messaged with.
        
        # Get all users current_user has had a message with
        # Using recipient_id instead of receiver_id based on User model associations
        user_ids_sent_to = Message.where(sender_id: @current_user.id).select(:recipient_id).distinct.pluck(:recipient_id)
        user_ids_received_from = Message.where(recipient_id: @current_user.id).select(:sender_id).distinct.pluck(:sender_id)
        
        other_user_ids = (user_ids_sent_to + user_ids_received_from).uniq.reject { |id| id == @current_user.id } # Exclude self

        conversations_preview = other_user_ids.map do |other_user_id|
          other_user = User.find_by(id: other_user_id)
          next if other_user.nil?

          last_message = Message.where(
            "(sender_id = :current_user_id AND recipient_id = :other_user_id) OR (sender_id = :other_user_id AND recipient_id = :current_user_id)",
            current_user_id: @current_user.id, other_user_id: other_user_id
          ).includes(:bicycle, :sender, :recipient, bicycle: { photos_attachments: :blob }).order(created_at: :desc).first # Added includes

          # Ensure User model has an avatar_url method or similar if you want to use it.
          # For now, assuming it might not exist and relying on frontend fallback for avatar.
          avatar_url = other_user.try(:avatar_url) # Safely try to get avatar_url

          {
            with_user: {
              id: other_user.id,
              name: other_user.name,
              avatar: avatar_url # Use the fetched avatar_url
            },
            last_message: last_message ? {
              content: last_message.content.truncate(50),
              created_at: last_message.created_at,
              is_read: last_message.sender_id == @current_user.id || (last_message.recipient_id == @current_user.id && last_message.is_read),
              sender_id: last_message.sender_id
            } : nil,
            updated_at: last_message&.created_at,
            bicycle_id: last_message&.bicycle_id,
            bicycle_title: last_message&.bicycle&.title,
            # Ensure photos.first exists before calling url_for
            bicycle_image_url: (last_message&.bicycle&.photos&.attached? && last_message.bicycle.photos.first) ? url_for(last_message.bicycle.photos.first) : nil
          }
        end.compact.sort_by { |c| c[:updated_at] || Time.at(0) }.reverse

        render json: conversations_preview
      end

      # GET /api/v1/messages/:other_user_id 
      # Fetches all messages between current user and other_user_id
      # The route for this might need to be /api/v1/users/:other_user_id/messages or /api/v1/conversations/:other_user_id
      # Assuming the :id param here is other_user_id for simplicity with existing routes.
      def show
        other_user_id = params[:id]
        messages = Message.where(
          "(sender_id = :current_user_id AND recipient_id = :other_user_id) OR (sender_id = :other_user_id AND recipient_id = :current_user_id)",
          current_user_id: @current_user.id, other_user_id: other_user_id
        ).order(created_at: :asc).includes(:sender, :recipient, :bicycle) # Eager load associations

        # Mark messages sent by the other user to the current user as read
        messages.where(sender_id: other_user_id, recipient_id: @current_user.id, is_read: false).update_all(is_read: true, read_at: Time.current)

        # 使用 MessageSerializer 進行序列化
        options = {}
        options[:include] = [:sender, :recipient, :bicycle] # 包含關聯資源
        
        render json: MessageSerializer.new(messages, options).serializable_hash
      end

      # POST /api/v1/messages
      def create
        if message_params[:recipient_id].to_i == @current_user.id
          render json: { errors: ["Cannot send a message to yourself."] }, status: :unprocessable_entity
          return
        end

        message = @current_user.sent_messages.build(message_params)
        # recipient_id must be in message_params
        if message.save
          # Here you might want to broadcast the message via ActionCable if using WebSockets
          # 使用 MessageSerializer 進行序列化
          options = {}
          options[:include] = [:sender] # 只包含發送者
          
          render json: MessageSerializer.new(message, options).serializable_hash, status: :created
        else
          render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def message_params
        params.require(:message).permit(:recipient_id, :content, :bicycle_id) # bicycle_id is optional, if message is about a specific bike
      end

      # def set_conversation
      #   # Logic to set @conversation based on params[:id] if it's a conversation ID
      # end
    end
  end
end
