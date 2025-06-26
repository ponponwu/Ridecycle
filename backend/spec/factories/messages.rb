FactoryBot.define do
  factory :message do
    association :sender, factory: :user
    association :recipient, factory: :user
    association :bicycle
    content { Faker::Lorem.sentence }
    is_offer { false }
    is_read { false }

    trait :offer do
      is_offer { true }
      offer_amount { Faker::Number.between(from: 1000, to: 50000) }
      offer_status { :pending }
      content { "我想出價 NT$#{offer_amount}" }
    end

    trait :accepted do
      offer_status { :accepted }
    end

    trait :rejected do
      offer_status { :rejected }
    end

    trait :expired do
      offer_status { :expired }
    end

    trait :read do
      is_read { true }
      read_at { Time.current }
    end
  end
end 