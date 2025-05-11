class Message < ApplicationRecord
  belongs_to :sender, class_name: 'User', foreign_key: 'sender_id'
  belongs_to :recipient, class_name: 'User', foreign_key: 'recipient_id'
  belongs_to :bicycle # Assuming all messages must be related to a bicycle

  validates :content, presence: true
  validates :sender_id, presence: true
  validates :recipient_id, presence: true
  validates :bicycle_id, presence: true # Ensure bicycle_id is always present
end
