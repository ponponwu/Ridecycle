class AddMissingFieldsToBicycles < ActiveRecord::Migration[7.1]
  def change
    add_column :bicycles, :bike_type, :string
    add_column :bicycles, :contact_method, :string
    add_column :bicycles, :status, :string, default: 'available'
    
    # 添加索引提高查詢效能
    add_index :bicycles, :status
    add_index :bicycles, :bike_type
  end
end
