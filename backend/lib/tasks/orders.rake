namespace :orders do
  desc "取消所有過期的訂單"
  task cancel_expired: :environment do
    puts "開始取消過期訂單..."
    result = CancelExpiredOrdersJob.perform_now
    
    if result.is_a?(Hash)
      puts "完成！共處理了 #{result[:expired_payments]} 個過期付款和 #{result[:cancelled_orders]} 個過期訂單"
    else
      puts "完成！共取消了 #{result} 個過期訂單"
    end
  end

  desc "顯示過期訂單統計"
  task show_expired_stats: :environment do
    expired_orders_count = Order.pending_and_expired.count
    expired_payments_count = OrderPayment.pending_and_expired.count
    
    puts "目前有 #{expired_orders_count} 個過期待付款訂單"
    puts "目前有 #{expired_payments_count} 個過期待處理付款"
    
    if expired_orders_count > 0
      puts "\n過期訂單詳細:"
      Order.pending_and_expired.includes(:user, :bicycle, :payment).each do |order|
        payment_status = order.payment&.status || 'N/A'
        expires_at = order.payment&.expires_at || 'N/A'
        puts "訂單: #{order.order_number}, 用戶: #{order.user.email}, 車輛: #{order.bicycle.title}, 付款狀態: #{payment_status}, 過期時間: #{expires_at}"
      end
    end
    
    if expired_payments_count > 0 && expired_payments_count != expired_orders_count
      puts "\n過期付款詳細:"
      OrderPayment.pending_and_expired.includes(order: [:user, :bicycle]).each do |payment|
        order = payment.order
        puts "付款: #{payment.id}, 訂單: #{order.order_number}, 用戶: #{order.user.email}, 過期時間: #{payment.expires_at}"
      end
    end
  end
end 