class AddBrandAndModelReferencesToBicycles < ActiveRecord::Migration[7.1]
  def change
    remove_column :bicycles, :brand, :string
    add_reference :bicycles, :brand, null: false, foreign_key: true
    add_reference :bicycles, :bicycle_model, null: false, foreign_key: true
    add_reference :bicycles, :transmission, null: false, foreign_key: true
  end
end
