class CancelExpiredOrdersJob < ApplicationJob
  queue_as :default

  def perform
    Rails.logger.info "開始執行取消過期訂單任務"
    
    # 同時處理 OrderPayment 和 Order 的過期邏輯
    payment_cancelled_count = OrderPayment.cancel_expired_payments!
    order_cancelled_count = Order.cancel_expired_orders!
    
    Rails.logger.info "取消過期訂單任務完成，共處理了 #{payment_cancelled_count} 個過期付款和 #{order_cancelled_count} 個過期訂單"
    
    # 回傳處理的總數量，方便測試和監控
    {
      expired_payments: payment_cancelled_count,
      cancelled_orders: order_cancelled_count,
      total: payment_cancelled_count + order_cancelled_count
    }
  end
end
