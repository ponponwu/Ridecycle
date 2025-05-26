class UpdateBicyclesFields < ActiveRecord::Migration[7.1]
  def change
    remove_index :bicycles, :bike_type if index_exists?(:bicycles, :bike_type)

    remove_column :bicycles, :bike_type
    add_column :bicycles, :bicycle_type, :integer
    
    # 新增其他 enum 欄位
    add_column :bicycles, :frame_material, :integer
    add_column :bicycles, :color, :integer
    add_column :bicycles, :is_frameset_only, :boolean, default: false

    change_column_null :bicycles, :bicycle_model_id, true
    
    # 新增索引
    add_index :bicycles, :bicycle_type
    add_index :bicycles, :frame_material
    add_index :bicycles, :color
    add_index :bicycles, :is_frameset_only
    # add_index :bicycles, :transmission_id
    add_index :bicycles, [:bicycle_type, :price]
    add_index :bicycles, [:location, :bicycle_type]
    add_index :bicycles, [:brand_id, :bicycle_type]
    add_index :bicycles, [:year, :bicycle_type]
    add_index :bicycles, [:status, :bicycle_type]
  end
end