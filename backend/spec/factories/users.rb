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
    
    trait :with_bank_account do
      after(:create) do |user|
        # 使用 update 而不是直接設定，確保加密正常工作
        user.update!(
          bank_account_name: '王小明',
          bank_account_number: '1234567890123',
          bank_code: '808',
          bank_branch: '台北分行'
        )
      end
    end

    # For semantic clarity in tests
    trait :seller do
      # No specific attributes needed, just for role identification
    end

    trait :buyer do
      # No specific attributes needed, just for role identification
    end
  end
end 