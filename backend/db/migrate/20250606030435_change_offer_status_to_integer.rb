class ChangeOfferStatusToInteger < ActiveRecord::Migration[7.1]
  def up
    # 添加新的 integer 欄位
    add_column :messages, :offer_status_int, :integer, default: 0
    
    # 遷移現有資料
    Message.reset_column_information
    Message.where(is_offer: true).find_each do |message|
      case message.offer_status
      when 'pending'
        message.update_column(:offer_status_int, 0)
      when 'accepted'
        message.update_column(:offer_status_int, 1)
      when 'rejected'
        message.update_column(:offer_status_int, 2)
      when 'expired'
        message.update_column(:offer_status_int, 3)
      end
    end
    
    # 移除舊的 string 欄位
    remove_column :messages, :offer_status
    
    # 重新命名新欄位
    rename_column :messages, :offer_status_int, :offer_status
    
    # 添加索引以提升查詢效能
    add_index :messages, [:bicycle_id, :offer_status], name: 'index_messages_on_bicycle_and_offer_status'
    add_index :messages, [:sender_id, :bicycle_id, :offer_status], name: 'index_messages_on_sender_bicycle_offer_status'
  end

  def down
    # 移除索引
    remove_index :messages, name: 'index_messages_on_bicycle_and_offer_status'
    remove_index :messages, name: 'index_messages_on_sender_bicycle_offer_status'
    
    # 添加舊的 string 欄位
    add_column :messages, :offer_status_str, :string, default: 'pending'
    
    # 遷移資料回去
    Message.reset_column_information
    Message.where(is_offer: true).find_each do |message|
      case message.offer_status
      when 0
        message.update_column(:offer_status_str, 'pending')
      when 1
        message.update_column(:offer_status_str, 'accepted')
      when 2
        message.update_column(:offer_status_str, 'rejected')
      when 3
        message.update_column(:offer_status_str, 'expired')
      end
    end
    
    # 移除 integer 欄位
    remove_column :messages, :offer_status
    
    # 重新命名回原欄位名
    rename_column :messages, :offer_status_str, :offer_status
  end
end
