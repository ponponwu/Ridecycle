FactoryBot.define do
  factory :transmission do
    sequence(:name) { |n| "#{['Single Speed', '7-Speed', '8-Speed', '9-Speed', '10-Speed', '11-Speed', '12-Speed', 'Internal Hub', 'Belt Drive'].sample} #{n}" }

    trait :single_speed do
      name { 'Single Speed' }
    end

    trait :multi_speed do
      name { ['7-Speed', '8-Speed', '9-Speed', '10-Speed', '11-Speed', '12-Speed'].sample }
    end

    trait :internal_hub do
      name { 'Internal Hub' }
    end

    trait :belt_drive do
      name { 'Belt Drive' }
    end
  end
end 