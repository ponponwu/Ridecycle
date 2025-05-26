class BicycleModel < ApplicationRecord
  include BicycleEnums

  belongs_to :brand
  belongs_to :component, optional: true
  # 虛擬屬性用於格式化價格顯示

  has_many :bicycles

  # serialize :frame_sizes_available, coder: Array

  # 驗證
  validates :name, presence: true
  validates :year, numericality: { only_integer: true, greater_than: 1980 }, allow_nil: true
  validates :msrp, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :original_msrp, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  def msrp_formatted
    "$#{msrp}"
  end

  def display_name
    "#{brand.name} #{name} (#{year})"
  end

  def transmission_name
    transmission&.name
  end

  def frame_sizes_available
    super || []
  end
  
  def has_frame_size?(size)
    frame_sizes_available.include?(size.to_s)
  end
end
