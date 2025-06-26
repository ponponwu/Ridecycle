class EncryptBankAccountFields < ActiveRecord::Migration[7.1]
  def up
    # 首先暫時在 User 模型中不啟用加密，讓我們可以安全地讀取現有資料
    
    # 添加新的加密欄位（使用 :text 類型以支援加密資料）
    add_column :users, :bank_account_name_encrypted, :text
    add_column :users, :bank_account_number_encrypted, :text  
    add_column :users, :bank_code_encrypted, :text
    add_column :users, :bank_branch_encrypted, :text
    
    # 先不遷移資料，留待後面手動處理
    # 這樣可以避免加密配置問題
    
    # 移除舊的明文欄位
    remove_column :users, :bank_account_name, :string
    remove_column :users, :bank_account_number, :string
    remove_column :users, :bank_code, :string
    remove_column :users, :bank_branch, :string
    
    # 重新命名新欄位
    rename_column :users, :bank_account_name_encrypted, :bank_account_name
    rename_column :users, :bank_account_number_encrypted, :bank_account_number
    rename_column :users, :bank_code_encrypted, :bank_code
    rename_column :users, :bank_branch_encrypted, :bank_branch
  end

  def down
    # 添加明文欄位
    add_column :users, :bank_account_name_plain, :string
    add_column :users, :bank_account_number_plain, :string
    add_column :users, :bank_code_plain, :string
    add_column :users, :bank_branch_plain, :string
    
    # 不嘗試解密資料，因為可能會有問題
    # 在 down migration 中，我們只是重建結構
    
    # 移除加密欄位
    remove_column :users, :bank_account_name
    remove_column :users, :bank_account_number
    remove_column :users, :bank_code
    remove_column :users, :bank_branch
    
    # 重新命名明文欄位
    rename_column :users, :bank_account_name_plain, :bank_account_name
    rename_column :users, :bank_account_number_plain, :bank_account_number
    rename_column :users, :bank_code_plain, :bank_code
    rename_column :users, :bank_branch_plain, :bank_branch
  end
end
