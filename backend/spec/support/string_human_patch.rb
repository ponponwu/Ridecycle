# spec/support/string_human_patch.rb
# 這是一個測試環境專用的 monkey patch，用來解決 Shoulda matchers 的 I18n 問題
# 只在測試環境中為 String 類別添加 human 方法

class String
  def human
    self.humanize
  end
end 