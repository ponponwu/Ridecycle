FactoryBot.define do
  factory :site_configuration do
    setting_key { "MyString" }
    setting_value { "MyText" }
    setting_type { "MyString" }
    description { "MyText" }
  end
end
