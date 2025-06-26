class CancelExpiredOrdersJob < ApplicationJob
  queue_as :default

  def perform
    Rails.logger.info "開始執行取消過期訂單任務"
    
    cancelled_count = Order.cancel_expired_orders!
    
    Rails.logger.info "取消過期訂單任務完成，共取消了 #{cancelled_count} 個訂單"
    
    # 回傳取消的訂單數量，方便測試和監控
    cancelled_count
  end
end
