class ChangeStatusToIntegerInBicycles < ActiveRecord::Migration[7.1]
  def up
    # 添加新的 integer status 欄位
    add_column :bicycles, :status_int, :integer, default: 0
    
    # 將現有的 string status 轉換為 integer
    # pending -> 0, available -> 1, sold -> 2, draft -> 3
    execute <<-SQL
      UPDATE bicycles 
      SET status_int = CASE 
        WHEN status = 'pending' THEN 0
        WHEN status = 'available' THEN 1
        WHEN status = 'sold' THEN 2
        WHEN status = 'draft' THEN 3
        ELSE 0
      END
    SQL
    
    # 移除舊的 string status 欄位
    remove_column :bicycles, :status
    
    # 重新命名新欄位為 status
    rename_column :bicycles, :status_int, :status
    
    # 添加索引
    add_index :bicycles, :status
  end

  def down
    # 添加 string status 欄位
    add_column :bicycles, :status_str, :string, default: 'available'
    
    # 將 integer status 轉換回 string
    execute <<-SQL
      UPDATE bicycles 
      SET status_str = CASE 
        WHEN status = 0 THEN 'pending'
        WHEN status = 1 THEN 'available'
        WHEN status = 2 THEN 'sold'
        WHEN status = 3 THEN 'draft'
        ELSE 'pending'
      END
    SQL
    
    # 移除 integer status 欄位
    remove_column :bicycles, :status
    
    # 重新命名為 status
    rename_column :bicycles, :status_str, :status
    
    # 添加索引
    add_index :bicycles, :status
  end
end
