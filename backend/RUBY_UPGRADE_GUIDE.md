# Ruby 3.x 升級完整指南

## 📋 目錄
- [升級概述](#升級概述)
- [環境準備](#環境準備)
- [升級步驟](#升級步驟)
- [語法修正指南](#語法修正指南)
- [測試驗證](#測試驗證)
- [故障排除](#故障排除)
- [部署指南](#部署指南)
- [檢查清單](#檢查清單)

---

## 🎯 升級概述

### 當前狀態
- **Rails 版本**: 7.1.5.1
- **Ruby 版本**: 2.7.7 ❌ (已 EOL)
- **目標版本**: Ruby 3.2.2 ✅ (推薦)

### 升級必要性
1. **安全性**: Ruby 2.7.x 已於 2023年3月 EOL，不再接收安全更新
2. **性能**: Ruby 3.x 比 2.7.x 快 10-20%
3. **功能**: 支援新的語言特性和改進
4. **生態系統**: 新的 gem 逐漸停止支援 Ruby 2.7.x

### 預期效益
- ✅ 提升應用程式安全性
- ✅ 改善執行性能
- ✅ 獲得長期支援（至 2026年3月）
- ✅ 可使用 Ruby 3.x 新功能

---

## 🛠 環境準備

### 1. 備份現有環境

```bash
# 備份當前專案
cp -r /path/to/project /path/to/project_backup_$(date +%Y%m%d)

# 備份資料庫（如果是本地開發）
pg_dump your_database > backup_$(date +%Y%m%d).sql

# 記錄當前 Ruby 和 gem 版本
ruby -v > ruby_version_backup.txt
bundle list > gem_versions_backup.txt
```

### 2. 安裝 Ruby 版本管理工具

#### 使用 rbenv (推薦)
```bash
# macOS 安裝 rbenv
brew install rbenv

# 列出可用的 Ruby 版本
rbenv install --list | grep 3.2

# 安裝 Ruby 3.2.2
rbenv install 3.2.2

# 設定為專案預設版本
rbenv local 3.2.2
```

#### 使用 RVM
```bash
# 安裝 RVM
curl -sSL https://get.rvm.io | bash

# 安裝 Ruby 3.2.2
rvm install 3.2.2

# 設定為預設版本
rvm use 3.2.2 --default
```

### 3. 驗證安裝
```bash
# 確認 Ruby 版本
ruby -v
# 應顯示: ruby 3.2.2

# 確認 gem 版本
gem -v

# 確認 bundler
gem install bundler
```

---

## 🚀 升級步驟

### Phase 1: 更新配置檔案

#### 1.1 更新 Gemfile
```ruby
# 修改第3行
# 從:
ruby "2.7.7"

# 改為:
ruby "3.2.2"
```

#### 1.2 更新 .ruby-version (如果存在)
```bash
# 在專案根目錄執行
echo "3.2.2" > .ruby-version
```

#### 1.3 更新 GitHub Actions (如果使用)
```yaml
# .github/workflows/test.yml
strategy:
  matrix:
    ruby-version: ['3.2.2']  # 更新這裡
```

### Phase 2: 重新安裝依賴

```bash
# 清除舊的 gem 安裝
rm -rf .bundle
rm Gemfile.lock

# 重新安裝 bundler
gem install bundler

# 安裝依賴
bundle install
```

### Phase 3: 檢查 gem 兼容性

#### 您的專案 gem 兼容性狀況：

| Gem | Ruby 3.2 支援 | 說明 |
|-----|---------------|------|
| rails (7.1.5) | ✅ 完全支援 | Rails 7.1 完全支援 Ruby 3.2 |
| pg | ✅ 完全支援 | PostgreSQL adapter 相容 |
| puma | ✅ 完全支援 | Web server 相容 |
| jwt | ✅ 完全支援 | JSON Web Token 相容 |
| bcrypt | ✅ 完全支援 | 密碼加密相容 |
| omniauth* | ✅ 完全支援 | OAuth 相關 gem 相容 |
| image_processing | ✅ 完全支援 | 圖片處理相容 |
| rspec-rails | ✅ 完全支援 | 測試框架相容 |
| whenever | ✅ 完全支援 | 排程任務相容 |

```bash
# 檢查是否有 gem 需要更新
bundle outdated

# 如果發現過時的 gem，更新它們
bundle update [gem_name]
```

---

## 🔧 語法修正指南

### 關鍵字參數修正

#### 1. Hash 作為關鍵字參數

**❌ 問題程式碼:**
```ruby
def process_user_data(user_id, options = {})
  # 處理邏輯
end

# 呼叫方式可能觸發警告
user_options = { format: 'json', validate: true }
process_user_data(123, user_options)  # Ruby 3.x 警告
```

**✅ 修正程式碼:**
```ruby
def process_user_data(user_id, **options)
  # 處理邏輯
end

# 正確呼叫方式
user_options = { format: 'json', validate: true }
process_user_data(123, **user_options)  # 正確
# 或直接傳遞
process_user_data(123, format: 'json', validate: true)  # 正確
```

#### 2. Controller 參數處理

**❌ 可能的問題:**
```ruby
class UsersController < ApplicationController
  def create
    @user = User.new(user_params)
    # ...
  end

  private

  def user_params
    params.require(:user).permit(:name, :email)
  end
end
```

**✅ 更安全的寫法:**
```ruby
class UsersController < ApplicationController
  def create
    @user = User.new(**user_params.to_h)
    # 或者保持原有寫法通常也沒問題
    @user = User.new(user_params)
  end

  private

  def user_params
    params.require(:user).permit(:name, :email)
  end
end
```

#### 3. Service 物件模式

**❌ 可能觸發警告:**
```ruby
class UserService
  def self.create_with_profile(user_attrs, profile_attrs = {})
    # 處理邏輯
  end
end

# 呼叫
profile_data = { bio: 'Hello', avatar_url: 'http://...' }
UserService.create_with_profile(user_data, profile_data)
```

**✅ 修正版本:**
```ruby
class UserService
  def self.create_with_profile(user_attrs, **profile_attrs)
    # 處理邏輯
  end
end

# 呼叫
profile_data = { bio: 'Hello', avatar_url: 'http://...' }
UserService.create_with_profile(user_data, **profile_data)
```

### 常見的 Rails 相關修正

#### ActiveRecord 查詢
```ruby
# 檢查您的查詢是否有類似模式
conditions = { status: 'active', published: true }

# 確保使用 Ruby 3.x 相容的語法
Model.where(**conditions)  # 推薦
# 或
Model.where(conditions)    # 通常也可以
```

#### JWT 處理
```ruby
# 檢查您的 JWT 相關程式碼
# 確保參數傳遞正確
def decode_token(token)
  JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')
end
```

---

## 🧪 測試驗證

### 1. 自動化測試

```bash
# 運行完整測試套件
bundle exec rspec

# 分類運行測試
bundle exec rspec spec/models/        # 模型測試
bundle exec rspec spec/controllers/   # 控制器測試
bundle exec rspec spec/requests/      # 請求測試
bundle exec rspec spec/jobs/          # 背景工作測試

# 檢查測試覆蓋率
COVERAGE=true bundle exec rspec
```

### 2. 手動功能測試

#### 基本功能測試清單
- [ ] 應用程式啟動 (`rails server`)
- [ ] 資料庫連接正常
- [ ] 基本 API 端點回應
- [ ] 靜態檔案載入

#### 認證功能測試
- [ ] 使用者註冊
- [ ] 使用者登入
- [ ] Google OAuth 登入
- [ ] Facebook OAuth 登入
- [ ] JWT Token 產生和驗證

#### 核心功能測試
- [ ] 圖片上傳和處理
- [ ] 資料庫 CRUD 操作
- [ ] 背景工作執行
- [ ] 排程任務 (whenever gem)

### 3. 性能基準測試

```bash
# 啟動時間比較
time rails runner "puts 'Rails loaded'"

# 記憶體使用量
rails runner "puts 'Memory: #{`ps -o rss= -p #{Process.pid}`.to_i} KB'"

# API 回應時間測試（可使用 curl 或 Postman）
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/health"
```

### 4. 警告檢查

```bash
# 執行應用程式並檢查警告
RUBYOPT="-W:deprecated" rails server

# 檢查測試中的警告
RUBYOPT="-W:deprecated" bundle exec rspec 2>&1 | grep -i deprecat

# 檢查日誌檔案
tail -f log/development.log | grep -i deprecat
```

---

## 🚨 故障排除

### 常見問題和解決方案

#### 問題 1: Gem 安裝失敗
```bash
# 錯誤：某些 gem 無法編譯
# 解決方案：
brew install libpq  # 如果 pg gem 有問題
brew install imagemagick  # 如果 image_processing 有問題

# 重新安裝問題 gem
bundle pristine [gem_name]
```

#### 問題 2: 關鍵字參數警告
```bash
# 大量警告出現時的批次檢查
grep -r "def.*(" app/ --include="*.rb" | grep -v "**"

# 使用 RuboCop 檢查
bundle exec rubocop --only Style/HashSyntax,Style/KeywordArguments
```

#### 問題 3: 測試失敗
```ruby
# 常見的測試修正
# 如果控制器測試失敗，檢查參數傳遞
RSpec.describe UsersController do
  it "creates user" do
    post :create, params: { user: user_attributes }
    # 而不是
    # post :create, user: user_attributes
  end
end
```

#### 問題 4: ActiveRecord 相關錯誤
```ruby
# 檢查模型中的 scope 定義
class User < ApplicationRecord
  # 確保 scope 參數正確
  scope :active, -> { where(status: 'active') }
  # 而不是依賴隱式 hash 轉換
end
```

### 回滾計劃

如果升級遇到無法解決的問題：

```bash
# 1. 回復 Ruby 版本
rbenv local 2.7.7
# 或 RVM
rvm use 2.7.7

# 2. 回復 Gemfile
git checkout HEAD~1 -- Gemfile

# 3. 重新安裝 gems
rm Gemfile.lock
bundle install

# 4. 從備份恢復（如果需要）
cp -r /path/to/project_backup/* .
```

---

## 🚢 部署指南

### 開發環境驗證完成後

#### 1. 更新 CI/CD 設定

**GitHub Actions 範例:**
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        ruby-version: ['3.2.2']
    steps:
    - uses: actions/checkout@v3
    - name: Set up Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: ${{ matrix.ruby-version }}
        bundler-cache: true
    - name: Run tests
      run: bundle exec rspec
```

#### 2. 預發佈環境部署

```bash
# 1. 部署到 staging 環境
# 2. 執行完整的功能測試
# 3. 監控性能和錯誤日誌
# 4. 確認所有功能正常運作
```

#### 3. 生產環境部署

```bash
# 確保備份
# 1. 備份應用程式
# 2. 備份資料庫
# 3. 記錄當前版本

# 部署新版本
# 1. 更新 Ruby 版本
# 2. 重新安裝 gems
# 3. 重新啟動應用程式服務
# 4. 監控應用程式狀態
```

### Docker 環境更新

如果使用 Docker：

```dockerfile
# Dockerfile
FROM ruby:3.2.2-alpine

# 其他設定保持不變
RUN apk add --no-cache build-base postgresql-dev

WORKDIR /app
COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .
CMD ["rails", "server", "-b", "0.0.0.0"]
```

---

## ✅ 檢查清單

### 升級前檢查
- [ ] 備份專案程式碼
- [ ] 備份資料庫
- [ ] 記錄當前 Ruby 和 gem 版本
- [ ] 確保所有測試通過（在 Ruby 2.7.7 下）
- [ ] 確認團隊成員了解升級計劃

### 升級過程檢查
- [ ] 安裝 Ruby 3.2.2
- [ ] 更新 Gemfile 中的 Ruby 版本
- [ ] 更新 .ruby-version 檔案
- [ ] 重新安裝 gems (`bundle install`)
- [ ] 檢查並修正關鍵字參數警告
- [ ] 運行完整測試套件
- [ ] 手動測試核心功能

### 功能驗證檢查
- [ ] 應用程式正常啟動
- [ ] 資料庫連接正常
- [ ] API 端點正常回應
- [ ] 使用者認證功能正常
- [ ] Google/Facebook OAuth 正常
- [ ] 圖片上傳功能正常
- [ ] 背景工作正常執行
- [ ] 排程任務正常運作

### 性能檢查
- [ ] 啟動時間未明顯增加
- [ ] API 回應時間正常或有改善
- [ ] 記憶體使用量正常
- [ ] 無明顯性能回歸

### 部署檢查
- [ ] 更新 CI/CD 設定
- [ ] 預發佈環境測試通過
- [ ] 生產環境備份完成
- [ ] 生產環境部署成功
- [ ] 監控系統正常

### 後續監控
- [ ] 錯誤日誌監控（第一週密切關注）
- [ ] 性能指標監控
- [ ] 使用者回饋收集
- [ ] 團隊培訓（Ruby 3.x 新功能）

---

## 📚 參考資源

### 官方文件
- [Ruby 3.2 Release Notes](https://www.ruby-lang.org/en/news/2022/12/25/ruby-3-2-0-released/)
- [Rails 7.1 Release Notes](https://guides.rubyonrails.org/7_1_release_notes.html)
- [Ruby 3.0 Keyword Arguments](https://www.ruby-lang.org/en/news/2019/12/12/separation-of-positional-and-keyword-arguments-in-ruby-3-0/)

### 升級指南
- [Rails Upgrade Guide](https://guides.rubyonrails.org/upgrading_ruby_on_rails.html)
- [Ruby 3.0 Migration Guide](https://blog.saeloun.com/2021/01/05/ruby-3-keyword-arguments.html)

### 工具和資源
- [RuboCop](https://rubocop.org/) - 程式碼品質檢查
- [bundle-audit](https://github.com/rubysec/bundler-audit) - 安全性檢查
- [Brakeman](https://brakemanscanner.org/) - Rails 安全掃描

---

## 📞 支援聯絡

如果在升級過程中遇到問題：

1. 檢查本指南的故障排除部分
2. 查詢相關 gem 的 GitHub Issues
3. 參考 Ruby 和 Rails 官方文件
4. 尋求社群支援（Ruby Taiwan、Rails Taiwan）

---

**升級愉快！** 🎉

記住：升級是一個漸進的過程，不要急於一次完成所有修改。保持耐心，仔細測試每個步驟，確保應用程式的穩定性和可靠性。