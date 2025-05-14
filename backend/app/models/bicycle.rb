class Bicycle < ApplicationRecord
  belongs_to :user
  belongs_to :seller, class_name: 'User', foreign_key: 'user_id'

  has_many_attached :photos # Use Active Storage for photos
  has_many :messages, dependent: :destroy
  
  validates :title, :price, :condition, :brand, :location, :bike_type, presence: true
  validates :status, inclusion: { in: ['available', 'sold', 'reserved'] }

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
end