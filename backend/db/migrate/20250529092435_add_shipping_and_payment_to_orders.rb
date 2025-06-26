class AddShippingAndPaymentToOrders < ActiveRecord::Migration[7.1]
  def change
    add_column :orders, :shipping_method, :string, default: 'self_pickup'
    add_column :orders, :shipping_distance, :decimal, precision: 10, scale: 2
    add_column :orders, :payment_method, :string, default: 'bank_transfer'
    add_column :orders, :company_account_info, :text
    add_column :orders, :payment_instructions, :text
  end
end
