# spec/support/shoulda_matchers.rb
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end

# I18n 問題已通過以下方式解決：
# 1. 在 config/locales/en.yml 和 config/locales/zh-TW.yml 中提供完整的 ActiveRecord 翻譯
# 2. 在 rails_helper.rb 中設定測試環境使用英文語言
# 3. 使用 Rails 內建的 I18n 機制，無需額外的程式碼修改 