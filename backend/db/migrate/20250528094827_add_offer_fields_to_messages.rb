class AddOfferFieldsToMessages < ActiveRecord::Migration[7.1]
  def change
    add_column :messages, :is_offer, :boolean, default: false, null: false
    add_column :messages, :offer_amount, :decimal, precision: 10, scale: 2
  end
end
