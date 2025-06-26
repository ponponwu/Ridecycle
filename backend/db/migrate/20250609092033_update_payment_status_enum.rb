class UpdatePaymentStatusEnum < ActiveRecord::Migration[7.1]
  def up
    # 更新 payment_status 的數值，為新的 awaiting_confirmation 狀態騰出空間
    # 原本: pending=0, paid=1, failed=2, refunded=3
    # 新的: pending=0, awaiting_confirmation=1, paid=2, failed=3, refunded=4
    
    # 先將現有的值往上移動
    execute "UPDATE orders SET payment_status = 4 WHERE payment_status = 3" # refunded: 3 -> 4
    execute "UPDATE orders SET payment_status = 3 WHERE payment_status = 2" # failed: 2 -> 3  
    execute "UPDATE orders SET payment_status = 2 WHERE payment_status = 1" # paid: 1 -> 2
    # pending 保持 0 不變
    # awaiting_confirmation 將使用 1
  end

  def down
    # 還原變更
    execute "UPDATE orders SET payment_status = 1 WHERE payment_status = 2" # paid: 2 -> 1
    execute "UPDATE orders SET payment_status = 2 WHERE payment_status = 3" # failed: 3 -> 2
    execute "UPDATE orders SET payment_status = 3 WHERE payment_status = 4" # refunded: 4 -> 3
    # 將 awaiting_confirmation (1) 設回 pending (0)
    execute "UPDATE orders SET payment_status = 0 WHERE payment_status = 1"
  end
end
