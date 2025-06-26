class AddPaymentDeadlineToOrders < ActiveRecord::Migration[7.1]
  def change
    add_column :orders, :payment_deadline, :datetime, comment: '付款期限'
    add_column :orders, :expires_at, :datetime, comment: '訂單過期時間（用於索引查詢）'
    
    # 添加索引以便快速查詢過期訂單
    add_index :orders, :expires_at
    add_index :orders, [:status, :expires_at]
  end
end
