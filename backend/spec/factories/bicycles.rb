# spec/factories/bicycles.rb
FactoryBot.define do
  factory :bicycle do
    association :user
    association :brand
    association :transmission
    
    title { Faker::Vehicle.make_and_model }
    description { Faker::Lorem.paragraph(sentence_count: 3) }
    price { Faker::Number.decimal(l_digits: 4, r_digits: 2) }
    model { Faker::Vehicle.model }
    year { Faker::Number.between(from: 2000, to: Date.current.year) }
    frame_size { %w[XS S M L XL].sample }
    bicycle_type { %w[road mountain hybrid].sample }
    condition { %w[brand_new like_new excellent good fair].sample }
    location { Faker::Address.city }
    contact_method { %w[phone email message].sample }
    status { 'available' }
    
    # 移除 specifications，因為 Bicycle 模型沒有這個屬性
    
    trait :with_photos do
      after(:build) do |bicycle|
        # 在測試環境中，我們可以附加測試圖片
        # bicycle.photos.attach(
        #   io: File.open(Rails.root.join('spec', 'fixtures', 'test_image.jpg')),
        #   filename: 'test_image.jpg',
        #   content_type: 'image/jpeg'
        # )
      end
    end
    
    trait :sold do
      status { 'sold' }
    end
    
    trait :draft do
      status { 'draft' }
    end
    
    trait :excellent_condition do
      condition { 'excellent' }
    end
    
    trait :road_bike do
      bicycle_type { 'road' }
    end
    
    trait :mountain_bike do
      bicycle_type { 'mountain' }
    end
  end
end 