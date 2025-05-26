FactoryBot.define do
  factory :user do
    name { Faker::Name.name }
    email { Faker::Internet.unique.email }
    password { 'password123' }
    password_confirmation { 'password123' }
    
    trait :with_provider do
      provider { 'google' }
      uid { Faker::Number.number(digits: 10).to_s }
    end
    
    trait :verified do
      email_verified_at { Time.current }
    end
    
    trait :with_bicycles do
      after(:create) do |user|
        create_list(:bicycle, 3, user: user)
      end
    end
  end
end 