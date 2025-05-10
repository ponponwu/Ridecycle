class CreateBicycleImages < ActiveRecord::Migration[7.1]
  def change
    create_table :bicycle_images do |t|
      t.references :bicycle, null: false, foreign_key: true
      t.string :image_url
      t.integer :position

      t.timestamps
    end
  end
end
