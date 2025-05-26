# app/models/brand.rb
class Brand < ApplicationRecord
  has_many :bicycle_models, dependent: :destroy
  has_many :bicycles, dependent: :nullify
  
  validates :name, presence: true, uniqueness: true

  scope :ordered, -> { order(name: :asc) }
  
end