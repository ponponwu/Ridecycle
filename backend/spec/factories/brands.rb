# spec/factories/brands.rb
FactoryBot.define do
  factory :brand do
    sequence(:name) { |n| "#{Faker::Vehicle.manufacture}-#{n}" }
    
    trait :popular do
      name { %w[Trek Specialized Giant Cannondale Scott Merida].sample }
    end
  end
end 