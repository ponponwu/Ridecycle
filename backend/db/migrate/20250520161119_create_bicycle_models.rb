class CreateBicycleModels < ActiveRecord::Migration[7.1]
  def change
    create_table :bicycle_models do |t|
      t.string :name
      t.integer :year
      t.references :brand, null: false, foreign_key: true
      t.decimal :msrp
      t.decimal :original_msrp
      t.string :component_name
      t.string :frame_material_code
      t.boolean :is_frameset
      # t.integer :family_id
      # t.string :image

      t.timestamps
    end
  end
end
