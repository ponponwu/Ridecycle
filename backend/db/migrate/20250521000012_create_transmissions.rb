class CreateTransmissions < ActiveRecord::Migration[7.0]
  def change
    create_table :transmissions do |t|
      t.string :name, null: false
      t.references :bicycle_models, :component, foreign_key: true

      t.timestamps
    end
    add_index :transmissions, :name, unique: true
  end
end 