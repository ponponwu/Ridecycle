class User < ApplicationRecord
  has_secure_password
  
  has_many :bicycles, dependent: :destroy
  has_many :sent_messages, class_name: 'Message', foreign_key: 'sender_id', dependent: :destroy
  has_many :received_messages, class_name: 'Message', foreign_key: 'recipient_id', dependent: :destroy
  has_many :orders, dependent: :destroy # Added orders association
  
  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
end