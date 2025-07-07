class AddSuspiciousAndBlacklistedToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :is_suspicious, :boolean, default: false, null: false
    add_column :users, :is_blacklisted, :boolean, default: false, null: false
    
    add_index :users, :is_suspicious
    add_index :users, :is_blacklisted
  end
end
