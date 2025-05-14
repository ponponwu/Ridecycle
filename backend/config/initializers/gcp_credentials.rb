# config/initializers/gcp_credentials.rb
if Rails.env.production? && ENV['GOOGLE_CLOUD_CREDENTIALS'].present?
  require 'fileutils'
  
  temp_credentials_path = '/tmp/gcp_credentials.json'
  
  begin
    # 確保目錄存在
    FileUtils.mkdir_p(File.dirname(temp_credentials_path))
    
    # 寫入憑證文件
    File.open(temp_credentials_path, 'w') do |f|
      f.write(ENV['GOOGLE_CLOUD_CREDENTIALS'])
    end
    
    # 設置文件權限
    FileUtils.chmod(0600, temp_credentials_path)
    
    # 設置環境變數指向這個文件
    ENV['GOOGLE_CLOUD_KEYFILE'] = temp_credentials_path
    
    Rails.logger.info "GCP credentials file created at #{temp_credentials_path}"
  rescue => e
    Rails.logger.error "Failed to create GCP credentials file: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
  end
end