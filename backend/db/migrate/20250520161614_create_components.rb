class CreateComponents < ActiveRecord::Migration[7.1]
  def change
    create_table :components do |t|
      t.string :name
      t.references :bicycle_models, :component, foreign_key: true

      t.timestamps
    end
  end
end
