# spec/factories/brands.rb
FactoryBot.define do
  factory :brand do
    name { Faker::Vehicle.manufacture }
    
    trait :popular do
      name { %w[Trek Specialized Giant Cannondale Scott Merida].sample }
    end
  end
end 