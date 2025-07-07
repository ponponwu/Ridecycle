FactoryBot.define do
  factory :order_payment do
    association :order
    status { 0 } # pending
    payment_method { 0 } # bank_transfer
    payment_id { "PAY-#{SecureRandom.hex(8)}" }
    amount { 5000.00 }
    deadline { 3.days.from_now }
    expires_at { 3.days.from_now }
    instructions { "Please transfer to our bank account" }
    company_account_info { "Bank: Test Bank, Account: 123456789" }
    metadata { {} }
    paid_at { nil }
    failed_at { nil }
    failure_reason { nil }

    trait :pending do
      status { 0 }
      paid_at { nil }
      failed_at { nil }
    end

    trait :awaiting_confirmation do
      status { 1 }
    end

    trait :paid do
      status { 2 }
      paid_at { 1.day.ago }
    end

    trait :failed do
      status { 3 }
      failed_at { 1.day.ago }
      failure_reason { "Payment timeout" }
    end

    trait :expired do
      deadline { 1.day.ago }
      expires_at { 1.day.ago }
    end
  end
end
