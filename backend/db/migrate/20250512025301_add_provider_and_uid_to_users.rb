class AddProviderAndUidToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :provider, :string
    add_column :users, :uid, :string

    add_index :users, [:provider, :uid], unique: true
  end
end
