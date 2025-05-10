class Bicycle < ApplicationRecord
  belongs_to :user
  has_many :bicycle_images, dependent: :destroy
  has_many :messages, dependent: :destroy
  
  validates :title, :price, :condition, :brand, :location, presence: true
end