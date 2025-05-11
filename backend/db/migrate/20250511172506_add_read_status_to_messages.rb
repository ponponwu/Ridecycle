class AddReadStatusToMessages < ActiveRecord::Migration[7.1]
  def change
    add_column :messages, :read_at, :datetime
    change_column :messages, :is_read, :boolean, default: false, null: false
  end
end
