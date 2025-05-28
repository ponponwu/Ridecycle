FactoryBot.define do
  factory :bicycle_model do
    association :brand
    name { Faker::Vehicle.model }
    description { Faker::Lorem.sentence }
    year { rand(2015..2024) }
    # 移除 specifications，因為 BicycleModel 沒有這個屬性

    trait :road_bike do
      bicycle_type { :road }
    end

    trait :mountain_bike do
      bicycle_type { :mountain }
    end

    trait :hybrid_bike do
      bicycle_type { :hybrid }
    end
  end
end 