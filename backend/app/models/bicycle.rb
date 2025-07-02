# Bicycle model representing a bicycle listing in the marketplace
# 
# @!attribute [rw] title
#   @return [String] The title of the bicycle listing
# @!attribute [rw] description
#   @return [String] Detailed description of the bicycle
# @!attribute [rw] price
#   @return [BigDecimal] The price of the bicycle
# @!attribute [rw] condition
#   @return [String] The condition of the bicycle (enum: brand_new, like_new, excellent, good, fair)
# @!attribute [rw] bicycle_type
#   @return [String] The type of bicycle (road, mountain, hybrid, etc.)
# @!attribute [rw] frame_size
#   @return [String] The frame size of the bicycle
# @!attribute [rw] location
#   @return [String] The location where the bicycle is available
# @!attribute [rw] status
#   @return [String] The listing status (available, sold, reserved)
# @!attribute [rw] year
#   @return [Integer] The year the bicycle was manufactured
# @!attribute [rw] model
#   @return [String] The model name of the bicycle
# @!attribute [rw] frame_material
#   @return [String] The material of the bicycle frame
# @!attribute [rw] color
#   @return [String] The color of the bicycle
# @!attribute [rw] is_frameset_only
#   @return [Boolean] Whether this listing is for frameset only
class Bicycle < ApplicationRecord
  include BicycleEnums

  # @!group Associations
  
  # @return [User] The user who owns this bicycle
  belongs_to :user
  
  # @return [User] Alias for user (seller) - more semantic naming
  alias_method :seller, :user
  
  # @return [Transmission, nil] The transmission type (optional)
  belongs_to :transmission, optional: true
  
  # @return [Brand, nil] The bicycle brand (optional)
  belongs_to :brand, optional: true
  
  # @return [BicycleModel, nil] The specific bicycle model (optional)
  belongs_to :bicycle_model, optional: true

  # @return [ActiveStorage::Attached::Many] Attached photos for the bicycle
  has_many_attached :photos # Use Active Storage for photos
  
  # @return [ActiveRecord::Associations::CollectionProxy<Message>] Messages related to this bicycle
  has_many :messages, dependent: :destroy
  
  # @!endgroup
  
  # @!group Enums and Validations
  
  # Defines the condition enum for bicycle condition
  # @return [Hash] Mapping of condition names to integer values
  enum condition: {
    brand_new: 0,
    like_new: 1,
    excellent: 2,
    good: 3,
    fair: 4,
    poor: 5
  }
  
  # Defines the status enum for bicycle listing status
  # @return [Hash] Mapping of status names to integer values
  enum status: {
    pending: 0,    # 待審核 (新建立的自行車預設狀態)
    available: 1,  # 可購買
    sold: 2,       # 已售出
    draft: 3       # 草稿/被拒絕
    reserved: 4,   # 被預定但尚未付款
  }
  
  # Validates presence of required fields
  validates :title, :price, :condition, :location, :bicycle_type, :frame_size, presence: true
  
  # Validates price is positive
  validates :price, numericality: { greater_than: 0 }
  
  # Validates length constraints
  validates :title, length: { maximum: 255 }
  validates :description, length: { maximum: 2000 }
  
  # Validates presence of additional required fields
  validates :description, :contact_method, presence: true
  
  # @!endgroup

  # @!group Scopes
  
  # Filters bicycles by category/type
  # @param category [String] The bicycle category to filter by
  # @return [ActiveRecord::Relation] Filtered bicycles
  scope :by_category, ->(category) { where(bicycle_type: category) if category.present? }
  
  # Filters bicycles by location (case-insensitive partial match)
  # @param location [String] The location to search for
  # @return [ActiveRecord::Relation] Filtered bicycles
  scope :by_location, ->(location) { where("location ILIKE ?", "%#{location}%") if location.present? }
  
  # Filters bicycles by frame size (case-insensitive partial match)
  # @param size [String] The frame size to search for
  # @return [ActiveRecord::Relation] Filtered bicycles
  scope :by_frame_size, ->(size) { where("frame_size ILIKE ?", "%#{size}%") if size.present? }
  
  # Filters bicycles by brand ID
  # @param brand_id [Integer] The brand ID to filter by
  # @return [ActiveRecord::Relation] Filtered bicycles
  scope :by_brand, ->(brand_id) { where(brand_id: brand_id) if brand_id.present? }
  
  # Filters bicycles by price range
  # @param min [Numeric] Minimum price
  # @param max [Numeric] Maximum price
  # @return [ActiveRecord::Relation] Filtered bicycles
  scope :by_price_range, ->(min, max) { where(price: min..max) if min.present? && max.present? }
  
  # Filters bicycles by frame material
  # @param material [String] The frame material to filter by
  # @return [ActiveRecord::Relation] Filtered bicycles
  scope :by_frame_material, ->(material) { where(frame_material: material) if material.present? }
  
  # Filters bicycles by year range
  # @param min [Integer] Minimum year
  # @param max [Integer] Maximum year
  # @return [ActiveRecord::Relation] Filtered bicycles
  scope :by_year_range, ->(min, max) { where(year: min..max) if min.present? && max.present? }
  
  # Filters bicycles by condition
  # @param condition [String] The condition to filter by
  # @return [ActiveRecord::Relation] Filtered bicycles
  scope :by_condition, ->(condition) { where(condition: condition) if condition.present? }
  
  # Filters bicycles by transmission ID
  # @param transmission_id [Integer] The transmission ID to filter by
  # @return [ActiveRecord::Relation] Filtered bicycles
  scope :by_transmission, ->(transmission_id) { where(transmission_id: transmission_id) if transmission_id.present? }
  
  # Filters bicycles that are frameset only
  # @param frameset_only [Boolean] Whether to filter for frameset only
  # @return [ActiveRecord::Relation] Filtered bicycles
  scope :frameset_only, ->(frameset_only) { where(is_frameset_only: frameset_only) if frameset_only.present? }
  
  # Filters bicycles by color
  # @param color [String] The color to filter by
  # @return [ActiveRecord::Relation] Filtered bicycles
  scope :by_color, ->(color) { where(color: color) if color.present? }
  
  # Returns available bicycles
  # @return [ActiveRecord::Relation] Available bicycles
  scope :available, -> { where(status: :available) }
  
  # @!endgroup

  # Set default status to pending for new bicycles
  before_validation :set_default_status, on: :create
  
  # 從 bicycle_model 自動同步資料
  after_save :sync_from_bicycle_model, if: :should_sync_from_model?

  # 定義一個方法來獲取指定索引圖片的 WebP 變體 (通用)
  def generate_webp_variant(photo_index = 0, variant_options = { convert: "webp", resize_to_limit: [1024, 1024], saver: { quality: 80 } })
    return nil unless photos.attached? && photos[photo_index].present?
    photo = photos[photo_index]
    return nil unless photo.variable?

    begin
      photo.variant(variant_options)
    rescue ActiveStorage::UnpreviewableError, ActiveStorage::UnvariableError => e
      Rails.logger.warn "Could not generate variant for Bicycle ##{id} photo ##{photo.id}: #{e.message}"
      nil
    rescue MiniMagick::Error, Vips::Error => e
      Rails.logger.error "Image processing error for Bicycle ##{id} photo ##{photo.id}: #{e.message}"
      nil
    end
  end

  # 詳細頁主圖 WebP
  def main_webp_photo_variant(index = 0)
    generate_webp_variant(index, { convert: "webp", resize_to_limit: [1024, 1024], saver: { quality: 80 } })
  end

  # 列表頁縮圖 WebP
  def thumbnail_webp_photo_variant(index = 0)
    generate_webp_variant(index, { convert: "webp", resize_to_fill: [300, 300], saver: { quality: 75 } })
  end

  # 獲取所有已附加圖片的主圖 WebP 變體列表
  def all_main_webp_photo_variants
    return [] unless photos.attached?
    photos.map.with_index { |photo, i| main_webp_photo_variant(i) }.compact
  end

  # 獲取所有已附加圖片的縮圖 WebP 變體列表
  def all_thumbnail_webp_photo_variants
    return [] unless photos.attached?
    photos.map.with_index { |photo, i| thumbnail_webp_photo_variant(i) }.compact
  end

  # 新增便利方法
  def transmission_name
    transmission&.name
  end
  
  def brand_name
    brand&.name
  end
  
  def model_name
    bicycle_model&.name || model
  end
  
  def full_display_name
    parts = [brand_name, model_name, year].compact
    parts.join(' ')
  end
  
  # Check if bicycle is available
  def available?
    status == 'available'
  end
  
  # Format price for display
  def display_price
    "$#{number_with_delimiter(price.to_f)}"
  end
  
  private
  
  def number_with_delimiter(number)
    number.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
  end
  
  def set_default_status
    self.status ||= :pending
  end
  
  def should_sync_from_model?
    bicycle_model_id_changed? && bicycle_model.present?
  end
  
  def sync_from_bicycle_model
    updates = {}
    
    # 只在目標欄位為空時才同步
    updates[:bicycle_type] = bicycle_model.bicycle_type if bicycle_type.blank? && bicycle_model.bicycle_type.present?
    updates[:frame_material] = bicycle_model.frame_material if frame_material.blank? && bicycle_model.frame_material.present?
    updates[:color] = bicycle_model.color if color.blank? && bicycle_model.color.present?
    updates[:transmission_id] = bicycle_model.transmission_id if transmission_id.blank? && bicycle_model.transmission_id.present?
    updates[:is_frameset_only] = bicycle_model.is_frameset if is_frameset_only.nil? && bicycle_model.is_frameset.present?
    
    update_columns(updates) if updates.any?
  end
end