class User < ApplicationRecord
  has_secure_password
  
  has_many :bicycles, dependent: :destroy
  has_many :sent_messages, class_name: 'Message', foreign_key: 'sender_id'
  has_many :received_messages, class_name: 'Message', foreign_key: 'recipient_id'
  
  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
end