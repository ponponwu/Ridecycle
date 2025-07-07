class CreateSiteConfigurations < ActiveRecord::Migration[7.1]
  def change
    create_table :site_configurations do |t|
      t.string :setting_key, null: false
      t.text :setting_value, null: false
      t.string :setting_type, default: 'string'
      t.text :description

      t.timestamps
    end
    add_index :site_configurations, :setting_key, unique: true

    # 插入預設設定
    reversible do |dir|
      dir.up do
        default_settings = {
          'site_name' => 'RideCycle',
          'contact_email' => 'admin@ridecycle.com',
          'bank_name' => '玉山銀行',
          'bank_code' => '808',
          'account_number' => '1234567890123',
          'account_name' => 'RideCycle 有限公司',
          'bank_branch' => '台北分行',
          'enable_registration' => 'true',
          'require_verification' => 'false',
          'bicycle_approval_required' => 'true'
        }

        default_settings.each do |key, value|
          execute <<~SQL
            INSERT INTO site_configurations (setting_key, setting_value, setting_type, created_at, updated_at)
            VALUES ('#{key}', '#{value}', '#{value.in?(['true', 'false']) ? 'boolean' : 'string'}', NOW(), NOW())
          SQL
        end
      end
    end
  end
end
