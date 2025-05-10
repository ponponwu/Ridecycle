class CreateMessages < ActiveRecord::Migration[7.1]
  def change
    create_table :messages do |t|
      t.integer :sender_id
      t.integer :recipient_id
      t.text :content
      t.references :bicycle, null: false, foreign_key: true
      t.boolean :is_read

      t.timestamps
    end
  end
end
