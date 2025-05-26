class Transmission < ApplicationRecord
  validates :name, presence: true, uniqueness: true

  has_many :bicycles, dependent: :nullify

  scope :ordered, -> { order(name: :asc) }

  # 暫時移除與 bicycle_models 的關聯，如果之後需要再加回來
  # has_many :bicycle_models 
end 