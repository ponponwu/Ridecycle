class MigrateOrderPaymentData < ActiveRecord::Migration[7.1]
  def up
    # Create OrderPayment records for existing orders
    execute <<-SQL
      INSERT INTO order_payments (
        order_id,
        status,
        method,
        payment_id,
        amount,
        deadline,
        expires_at,
        instructions,
        company_account_info,
        metadata,
        created_at,
        updated_at
      )
      SELECT 
        id as order_id,
        payment_status as status,
        payment_method as method,
        payment_id,
        total_price as amount,
        COALESCE(payment_deadline, created_at + INTERVAL '3 days') as deadline,
        COALESCE(expires_at, payment_deadline, created_at + INTERVAL '3 days') as expires_at,
        payment_instructions as instructions,
        company_account_info,
        '{}' as metadata,
        created_at,
        updated_at
      FROM orders
      WHERE NOT EXISTS (
        SELECT 1 FROM order_payments WHERE order_payments.order_id = orders.id
      );
    SQL

    puts "Migrated #{Order.count} orders to order_payments"
  end

  def down
    # Remove all OrderPayment records (they will be recreated from Order data if needed)
    OrderPayment.delete_all
    puts "Removed all order_payments records"
  end
end