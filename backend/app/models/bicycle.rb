class Bicycle < ApplicationRecord
  belongs_to :user
  belongs_to :seller, class_name: 'User', foreign_key: 'user_id'

  has_many_attached :photos # Use Active Storage for photos
  has_many :messages, dependent: :destroy
  
  validates :title, :price, :condition, :brand, :location, :bike_type, presence: true
  validates :status, inclusion: { in: ['available', 'sold', 'reserved'] }
end