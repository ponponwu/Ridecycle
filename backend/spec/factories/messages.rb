FactoryBot.define do
  factory :message do
    association :bicycle
    association :sender, factory: :user
    association :recipient, factory: :user
    content { Faker::Lorem.paragraph }
    created_at { Time.current }
    updated_at { Time.current }
  end
end 