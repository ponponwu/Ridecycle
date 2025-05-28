class CreateCspViolationReports < ActiveRecord::Migration[7.1]
  def change
    create_table :csp_violation_reports do |t|
      # CSP 違規資訊
      t.string :directive, null: false
      t.text :blocked_uri, null: false
      t.text :source_file
      t.integer :line_number
      t.integer :column_number
      
      # 請求資訊
      t.text :user_agent, null: false
      t.text :url, null: false
      t.datetime :timestamp
      t.string :ip_address, null: false
      t.text :referrer
      
      # 會話和用戶資訊
      t.string :session_id
      t.references :user, null: true, foreign_key: true
      
      # 環境資訊
      t.string :environment, default: 'production'

      t.timestamps
    end
    
    # 添加索引以提高查詢效能
    add_index :csp_violation_reports, :directive
    add_index :csp_violation_reports, :blocked_uri
    add_index :csp_violation_reports, [:directive, :blocked_uri]
    add_index :csp_violation_reports, :created_at
    add_index :csp_violation_reports, :session_id
    add_index :csp_violation_reports, :environment
    add_index :csp_violation_reports, :ip_address
    
    # 複合索引用於常見查詢
    add_index :csp_violation_reports, [:directive, :created_at]
    add_index :csp_violation_reports, [:environment, :created_at]
  end
end
