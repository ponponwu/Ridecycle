class SiteConfiguration < ApplicationRecord
  validates :setting_key, presence: true, uniqueness: true
  validates :setting_value, presence: true
  validates :setting_type, inclusion: { in: %w[string number boolean] }

  before_validation :set_default_type

  # 獲取設定值
  def self.get_setting(key, default_value = nil)
    setting = find_by(setting_key: key)
    return default_value unless setting
    
    cast_value(setting.setting_value, setting.setting_type)
  end

  # 設定值
  def self.set_setting(key, value, description = nil)
    setting = find_or_initialize_by(setting_key: key)
    setting.setting_value = value.to_s
    setting.setting_type = detect_type(value)
    setting.description = description if description.present?
    setting.save!
    setting
  end

  # 批量設定
  def self.set_settings(settings_hash)
    settings_hash.each do |key, value|
      set_setting(key, value)
    end
  end

  # 獲取所有設定
  def self.all_settings
    all.each_with_object({}) do |setting, hash|
      hash[setting.setting_key] = cast_value(setting.setting_value, setting.setting_type)
    end
  end

  private

  def set_default_type
    self.setting_type ||= 'string'
  end

  def self.detect_type(value)
    case value
    when TrueClass, FalseClass
      'boolean'
    when Numeric
      'number'
    else
      'string'
    end
  end

  def self.cast_value(value, type)
    case type
    when 'boolean'
      value.in?(['true', '1', 1, true])
    when 'number'
      value.to_f
    else
      value.to_s
    end
  end
end
