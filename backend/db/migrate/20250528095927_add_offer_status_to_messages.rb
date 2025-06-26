class AddOfferStatusToMessages < ActiveRecord::Migration[7.1]
  def change
    add_column :messages, :offer_status, :string, default: 'pending'
    
    # 添加索引以提高查詢效能
    add_index :messages, [:sender_id, :recipient_id, :bicycle_id, :is_offer, :offer_status], 
              name: 'index_messages_on_offer_lookup'
  end
end
