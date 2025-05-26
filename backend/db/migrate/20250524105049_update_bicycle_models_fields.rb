class UpdateBicycleModelsFields < ActiveRecord::Migration[7.1]
  def change
    # 移除舊欄位
    remove_column :bicycle_models, :component_name, :string if column_exists?(:bicycle_models, :component_name)
    remove_column :bicycle_models, :frame_material_code, :string if column_exists?(:bicycle_models, :frame_material_code)
    
    # 新增 transmission 關聯
    add_reference :bicycle_models, :transmission, null: true, foreign_key: true
    
    # 新增 enum 欄位
    add_column :bicycle_models, :bicycle_type, :integer
    add_column :bicycle_models, :frame_material, :integer
    add_column :bicycle_models, :color, :integer
    
    # 新增其他欄位
    add_column :bicycle_models, :frame_sizes_available, :text # JSON array
    add_column :bicycle_models, :description, :text
    
    # 新增索引
    add_index :bicycle_models, :bicycle_type
    add_index :bicycle_models, :frame_material
    add_index :bicycle_models, :color
    # add_index :bicycle_models, :transmission_id
    add_index :bicycle_models, :year
    add_index :bicycle_models, [:brand_id, :bicycle_type]
    add_index :bicycle_models, [:year, :bicycle_type]
  end
end