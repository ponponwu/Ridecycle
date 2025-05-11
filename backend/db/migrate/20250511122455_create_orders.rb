class CreateOrders < ActiveRecord::Migration[7.0] # Adjust Rails version if needed
  def change
    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true # Buyer
      t.references :bicycle, null: false, foreign_key: true
      t.string :order_number, null: false, index: { unique: true }
      t.integer :status, default: 0, null: false # For Rails enum, stores integer
      t.decimal :subtotal, precision: 10, scale: 2
      t.decimal :shipping_cost, precision: 10, scale: 2
      t.decimal :tax, precision: 10, scale: 2
      t.decimal :total_price, precision: 10, scale: 2, null: false
      
      t.jsonb :shipping_address # Stores IShippingAddress
      t.jsonb :payment_details  # Stores payment info like method, transaction ID etc.
      # t.string :payment_method_name # if you want a simple string for payment method
      
      t.string :tracking_number
      t.string :carrier
      t.text :notes # Buyer's notes for the order
      t.text :cancel_reason
      
      t.integer :payment_status, default: 0, null: false # For Rails enum
      t.string :payment_id # From payment gateway

      # Fields for reviews/ratings if done at order level
      # t.integer :rating 
      # t.text :review

      t.datetime :estimated_delivery_at # Changed from string to datetime

      t.timestamps
    end
  end
end