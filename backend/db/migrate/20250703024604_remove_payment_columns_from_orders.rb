class RemovePaymentColumnsFromOrders < ActiveRecord::Migration[7.1]
  def up
    # Remove payment-related columns that are now in OrderPayment
    remove_column :orders, :payment_status, :integer
    remove_column :orders, :payment_id, :string
    remove_column :orders, :payment_deadline, :datetime
    remove_column :orders, :expires_at, :datetime
    remove_column :orders, :payment_instructions, :text
    remove_column :orders, :company_account_info, :text
    remove_column :orders, :payment_method, :integer

    # Remove indexes that are no longer needed
    remove_index :orders, name: :index_orders_on_expires_at if index_exists?(:orders, :expires_at)
    remove_index :orders, name: :index_orders_on_status_and_expires_at if index_exists?(:orders, [:status, :expires_at])

    puts "Removed payment-related columns from orders table"
  end

  def down
    # Re-add payment-related columns (for rollback)
    add_column :orders, :payment_status, :integer, default: 0, null: false
    add_column :orders, :payment_id, :string
    add_column :orders, :payment_deadline, :datetime
    add_column :orders, :expires_at, :datetime
    add_column :orders, :payment_instructions, :text
    add_column :orders, :company_account_info, :text
    add_column :orders, :payment_method, :integer, default: 0

    # Re-add indexes
    add_index :orders, :expires_at
    add_index :orders, [:status, :expires_at]

    # Repopulate from OrderPayment data
    execute <<-SQL
      UPDATE orders 
      SET 
        payment_status = order_payments.status,
        payment_id = order_payments.payment_id,
        payment_deadline = order_payments.deadline,
        expires_at = order_payments.expires_at,
        payment_instructions = order_payments.instructions,
        company_account_info = order_payments.company_account_info,
        payment_method = order_payments.method
      FROM order_payments
      WHERE orders.id = order_payments.order_id;
    SQL

    puts "Restored payment-related columns to orders table"
  end
end