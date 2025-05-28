namespace :admin do
  desc "Create an admin user"
  task create: :environment do
    email = ENV['ADMIN_EMAIL'] || 'admin@ridecycle.com'
    password = ENV['ADMIN_PASSWORD'] || 'admin123456'
    name = ENV['ADMIN_NAME'] || 'Admin User'

    # 檢查用戶是否已存在
    user = User.find_by(email: email)
    
    if user
      # 如果用戶存在，將其設為管理員
      user.update!(admin: true)
      puts "✅ 用戶 #{email} 已設為管理員"
    else
      # 創建新的管理員用戶
      user = User.create!(
        email: email,
        password: password,
        password_confirmation: password,
        name: name,
        admin: true
      )
      puts "✅ 管理員用戶已創建："
      puts "   Email: #{email}"
      puts "   Password: #{password}"
      puts "   Name: #{name}"
    end
  end

  desc "List all admin users"
  task list: :environment do
    admins = User.where(admin: true)
    
    if admins.any?
      puts "📋 管理員用戶列表："
      admins.each do |admin|
        puts "   ID: #{admin.id}, Email: #{admin.email}, Name: #{admin.name}"
      end
    else
      puts "❌ 沒有找到管理員用戶"
    end
  end

  desc "Remove admin privileges from a user"
  task :remove, [:email] => :environment do |t, args|
    email = args[:email]
    
    if email.blank?
      puts "❌ 請提供用戶 email: rake admin:remove[user@example.com]"
      exit 1
    end

    user = User.find_by(email: email)
    
    if user
      user.update!(admin: false)
      puts "✅ 已移除 #{email} 的管理員權限"
    else
      puts "❌ 找不到用戶: #{email}"
    end
  end
end 