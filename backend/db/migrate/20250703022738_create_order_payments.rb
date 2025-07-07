class CreateOrderPayments < ActiveRecord::Migration[7.1]
  def change
    create_table :order_payments do |t|
      t.references :order, null: false, foreign_key: true
      t.integer :status, default: 0, null: false
      t.integer :method, default: 0, null: false
      t.string :payment_id
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.datetime :deadline, null: false
      t.datetime :expires_at, null: false
      t.text :instructions
      t.text :company_account_info
      t.jsonb :metadata, default: {}
      t.datetime :paid_at
      t.datetime :failed_at
      t.string :failure_reason

      t.timestamps
    end

    # Add indexes for performance
    add_index :order_payments, :status
    add_index :order_payments, :expires_at
    add_index :order_payments, [:status, :expires_at]
    add_index :order_payments, :payment_id, unique: true, where: "payment_id IS NOT NULL"
  end
end
