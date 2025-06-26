class ChangeOrderEnumFieldsToInteger < ActiveRecord::Migration[7.1]
  def up
    # 添加新的 integer 欄位
    add_column :orders, :shipping_method_int, :integer, default: 0
    add_column :orders, :payment_method_int, :integer, default: 0
    
    # 遷移現有資料
    Order.reset_column_information
    Order.find_each do |order|
      # 轉換 shipping_method
      shipping_method_value = case order.shipping_method
      when 'self_pickup'
        0
      when 'assisted_delivery'
        1
      else
        0
      end
      
      # 轉換 payment_method
      payment_method_value = case order.payment_method
      when 'bank_transfer'
        0
      else
        0
      end
      
      order.update_columns(
        shipping_method_int: shipping_method_value,
        payment_method_int: payment_method_value
      )
    end
    
    # 移除舊的 string 欄位
    remove_column :orders, :shipping_method
    remove_column :orders, :payment_method
    
    # 重新命名新欄位
    rename_column :orders, :shipping_method_int, :shipping_method
    rename_column :orders, :payment_method_int, :payment_method
  end

  def down
    # 添加舊的 string 欄位
    add_column :orders, :shipping_method_str, :string, default: 'self_pickup'
    add_column :orders, :payment_method_str, :string, default: 'bank_transfer'
    
    # 遷移資料回去
    Order.reset_column_information
    Order.find_each do |order|
      # 轉換 shipping_method
      shipping_method_value = case order.shipping_method
      when 0
        'self_pickup'
      when 1
        'assisted_delivery'
      else
        'self_pickup'
      end
      
      # 轉換 payment_method
      payment_method_value = case order.payment_method
      when 0
        'bank_transfer'
      else
        'bank_transfer'
      end
      
      order.update_columns(
        shipping_method_str: shipping_method_value,
        payment_method_str: payment_method_value
      )
    end
    
    # 移除 integer 欄位
    remove_column :orders, :shipping_method
    remove_column :orders, :payment_method
    
    # 重新命名回原欄位名
    rename_column :orders, :shipping_method_str, :shipping_method
    rename_column :orders, :payment_method_str, :payment_method
  end
end
