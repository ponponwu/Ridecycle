namespace :orders do
  desc "取消所有過期的訂單"
  task cancel_expired: :environment do
    puts "開始取消過期訂單..."
    cancelled_count = CancelExpiredOrdersJob.perform_now
    puts "完成！共取消了 #{cancelled_count} 個過期訂單"
  end

  desc "顯示過期訂單統計"
  task show_expired_stats: :environment do
    expired_count = Order.pending_and_expired.count
    puts "目前有 #{expired_count} 個過期待付款訂單"
    
    if expired_count > 0
      Order.pending_and_expired.includes(:user, :bicycle).each do |order|
        puts "訂單: #{order.order_number}, 用戶: #{order.user.email}, 車輛: #{order.bicycle.title}, 過期時間: #{order.expires_at}"
      end
    end
  end
end 