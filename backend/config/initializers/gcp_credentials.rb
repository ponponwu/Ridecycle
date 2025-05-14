# # config/initializers/gcp_credentials.rb
# if ENV['GOOGLE_CLOUD_CREDENTIALS'].present? && Rails.env.production?
#   require 'fileutils'
  
#   begin
#     # 確保 config 目錄存在
#     FileUtils.mkdir_p(Rails.root.join('config'))
    
#     # 將環境變數的內容寫入文件
#     File.open(Rails.root.join('config/gcp_credentials.json'), 'w') do |f|
#       f.write(ENV['GOOGLE_CLOUD_CREDENTIALS'])
#     end
    
#     # 設置正確的文件權限
#     FileUtils.chmod(0600, Rails.root.join('config/gcp_credentials.json'))
    
#     Rails.logger.info "GCP credentials file created successfully"
#   rescue => e
#     Rails.logger.error "Failed to create GCP credentials file: #{e.message}"
#   end
# end