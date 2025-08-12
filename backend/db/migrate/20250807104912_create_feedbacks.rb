class CreateFeedbacks < ActiveRecord::Migration[7.1]
  def change
    create_table :feedbacks do |t|
      t.references :user, null: false, foreign_key: true
      t.string :subject, null: false, limit: 200
      t.text :content, null: false, limit: 2000
      t.integer :category, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.text :admin_response
      t.datetime :responded_at

      t.timestamps
    end

    add_index :feedbacks, :category
    add_index :feedbacks, :status
    add_index :feedbacks, :created_at
  end
end
