# frozen_string_literal: true

FactoryBot.define do
  factory :order do
    association :user
    association :bicycle
    
    sequence(:order_number) { |n| "R-#{Date.current.strftime('%y%m%d')}-#{sprintf('%06X', n)}" }
    total_price { 15000 }
    status { :pending }
    payment_status { :pending }
    payment_method { :bank_transfer }
    shipping_method { :assisted_delivery }
    shipping_distance { 5 }
    
    shipping_address do
      {
        full_name: '王小明',
        phone_number: '0912345678',
        county: '台北市',
        district: '信義區',
        address_line1: '信義路五段7號',
        address_line2: '10樓',
        postal_code: '110',
        delivery_notes: '請在上班時間送達'
      }
    end
    
    payment_details do
      {
        transfer_note: '訂單付款',
        account_last_five_digits: '12345'
      }
    end
    
    trait :completed do
      status { :completed }
      payment_status { :paid }
    end
    
    trait :cancelled do
      status { :cancelled }
      cancel_reason { '買家取消' }
    end
    
    trait :with_tracking do
      status { :shipped }
      tracking_number { 'TRK123456789' }
      carrier { '黑貓宅急便' }
    end
    
    trait :self_pickup do
      shipping_method { :self_pickup }
      shipping_distance { nil }
    end

    trait :processing do
      status { :processing }
    end

    trait :shipped do
      status { :shipped }
    end

    trait :delivered do
      status { :delivered }
    end

    trait :refunded do
      status { :refunded }
    end

    trait :failed do
      payment_status { :failed }
    end

    trait :payment_refunded do
      payment_status { :refunded }
    end
  end
end 