class CreateBicycles < ActiveRecord::Migration[7.1]
  def change
    create_table :bicycles do |t|
      t.string :title
      t.text :description
      t.decimal :price
      t.integer :condition, default: 0
      t.string :brand
      t.string :model
      t.integer :year
      t.string :frame_size
      t.string :location
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
