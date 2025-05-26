# app/models/concerns/bicycle_enums.rb
module BicycleEnums
  extend ActiveSupport::Concern

  included do
    enum bicycle_type: {
      road: 0,
      mountain: 1,
      hybrid: 2,
      gravel: 3,
    }
  
    enum frame_material: {
      carbon: 0,
      aluminum: 1,
      steel: 2,
      titanium: 3,
      composite: 4
    }
    
    enum color: {
      black: 0,
      white: 1,
      red: 2,
      blue: 3,
      green: 4,
      yellow: 5,
      silver: 6,
      grey: 7,
      orange: 8,
      other: 9
    }
  end

  # 可以加入共用的類別方法
  class_methods do
    def bicycle_type_options_for_select
      bicycle_types.map { |key, value| [key.humanize, key] }
    end

    def frame_material_options_for_select
      frame_materials.map { |key, value| [key.humanize, key] }
    end

    def color_options_for_select
      colors.map { |key, value| [key.humanize, key] }
    end
  end

  # 可以加入共用的實例方法
  def display_specifications
    specs = []
    specs << bicycle_type.humanize if respond_to?(:bicycle_type) && bicycle_type.present?
    specs << frame_material.humanize if respond_to?(:frame_material) && frame_material.present?
    specs << color.humanize if respond_to?(:color) && color.present?
    specs.join(' • ')
  end
end