# frozen_string_literal: true

# API controller for message management
# Handles messaging operations between users
#
# @author RideCycle Team
# @since 1.0.0
module Api
  module V1
    class MessagesController < ApplicationController
      before_action :authenticate_user!
      before_action :set_message, only: [:accept_offer, :reject_offer]
      before_action :validate_offer_message, only: [:accept_offer, :reject_offer]
      before_action :validate_offer_permissions, only: [:accept_offer, :reject_offer]

      # Gets conversation list for current user
      # 
      # @api public
      # @example GET /api/v1/messages
      # @return [JSON] Conversations list in JSON:API format
      def index
        conversations = MessageService.get_conversations(current_user)
        render_jsonapi_custom(
          type: 'conversations',
          id: current_user.id,
          attributes: { conversations: conversations }
        )
      end

      # Gets conversation messages with specific user
      # 
      # @api public
      # @example GET /api/v1/messages/:other_user_id
      # @param [String] id Other user ID
      # @return [JSON] Messages collection in JSON:API format
      def show
        other_user_id = params[:id]
        messages = MessageService.get_conversation_messages(current_user, other_user_id)
        render_jsonapi_collection(messages, serializer: MessageSerializer)
      end

      # Creates a new message
      # 
      # @api public
      # @example POST /api/v1/messages
      # @param [Hash] message The message parameters
      # @option message [String] :recipient_id Recipient user ID
      # @option message [String] :content Message content
      # @option message [String] :bicycle_id Bicycle ID (optional)
      # @option message [Boolean] :is_offer Whether this is an offer (optional)
      # @option message [Decimal] :offer_amount Offer amount (optional)
      # @return [JSON] Created message in JSON:API format
      # @return [JSON] Error messages if validation fails
      def create
        result = MessageService.create_message(current_user, message_params)
        
        if result.success?
          render_jsonapi_resource(result.data, serializer: MessageSerializer, status: :created)
        else
          render_jsonapi_errors(result.errors, status: result.status)
        end
      end

      # Accepts an offer message
      # 
      # @api public
      # @example POST /api/v1/messages/:id/accept_offer
      # @param [String] id Message ID
      # @return [JSON] Accepted offer details in JSON:API format
      # @return [JSON] Error messages if operation fails
      def accept_offer
        result = OfferService.accept_offer(@message, current_user)
        
        if result.success?
          render_jsonapi_custom(
            type: 'offer_acceptance',
            id: @message.id,
            attributes: {
              accepted_offer: MessageSerializer.new(result.data[:accepted_offer]).serializable_hash,
              response_message: MessageSerializer.new(result.data[:response_message]).serializable_hash,
              order: result.data[:order] ? OrderSerializer.new(result.data[:order]).serializable_hash : nil
            }
          )
        else
          render_jsonapi_errors(result.errors, status: result.status)
        end
      end
      
      # Rejects an offer message
      # 
      # @api public
      # @example POST /api/v1/messages/:id/reject_offer
      # @param [String] id Message ID
      # @return [JSON] Rejected offer details in JSON:API format
      # @return [JSON] Error messages if operation fails
      def reject_offer
        result = OfferService.reject_offer(@message, current_user)
        
        if result.success?
          render_jsonapi_custom(
            type: 'offer_rejection',
            id: @message.id,
            attributes: {
              rejected_offer: MessageSerializer.new(result.data[:rejected_offer]).serializable_hash,
              response_message: MessageSerializer.new(result.data[:response_message]).serializable_hash
            }
          )
        else
          render_jsonapi_errors(result.errors, status: result.status)
        end
      end

      private

      def message_params
        params.require(:message).permit(:recipient_id, :content, :bicycle_id, :is_offer, :offer_amount)
      end

      def set_message
        @message = Message.includes(:sender, :recipient, :bicycle).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_jsonapi_errors(['出價訊息不存在'], status: :not_found)
      end

      def validate_offer_message
        return if @message&.is_offer? && @message&.offer_pending?
        
        render_jsonapi_errors(['這個出價無法處理'], status: :unprocessable_entity)
      end

      def validate_offer_permissions
        return if @message&.recipient_id == current_user.id
        
        action_text = action_name == 'accept_offer' ? '接受' : '拒絕'
        render_jsonapi_errors(["您沒有權限#{action_text}這個出價"], status: :forbidden)
      end
    end
  end
end
