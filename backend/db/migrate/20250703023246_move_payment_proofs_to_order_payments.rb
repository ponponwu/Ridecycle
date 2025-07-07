class MovePaymentProofsToOrderPayments < ActiveRecord::Migration[7.1]
  def up
    # Move payment_proofs attachments from Order to OrderPayment
    # Update the record_type and record_id in active_storage_attachments
    execute <<-SQL
      UPDATE active_storage_attachments 
      SET 
        record_type = 'OrderPayment',
        record_id = order_payments.id
      FROM order_payments
      WHERE active_storage_attachments.record_type = 'Order'
        AND active_storage_attachments.name = 'payment_proofs'
        AND active_storage_attachments.record_id = order_payments.order_id;
    SQL

    puts "Moved payment_proofs attachments from orders to order_payments"
  end

  def down
    # Move payment_proofs attachments back from OrderPayment to Order
    execute <<-SQL
      UPDATE active_storage_attachments 
      SET 
        record_type = 'Order',
        record_id = order_payments.order_id
      FROM order_payments
      WHERE active_storage_attachments.record_type = 'OrderPayment'
        AND active_storage_attachments.name = 'payment_proofs'
        AND active_storage_attachments.record_id = order_payments.id;
    SQL

    puts "Moved payment_proofs attachments back from order_payments to orders"
  end
end