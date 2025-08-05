class UpdateEncryptedMessageContent < ActiveRecord::Migration[7.1]
  def up
    # Since encrypted message content cannot be decrypted with current keys,
    # we'll replace them with placeholder text for development/testing purposes
    Message.find_each do |message|
      # Try to read the content, if it fails (encrypted), replace with placeholder
      begin
        content = message.read_attribute_before_type_cast(:content)
        if content.is_a?(String) && content.length < 100 && !content.include?(" ")
          # This looks like encrypted content (short, no spaces)
          # Replace with a placeholder message
          message.update_column(:content, "訊息內容 (已轉換為明文)")
        end
      rescue => e
        # If there's any error reading the content, set a placeholder
        message.update_column(:content, "訊息內容 (已轉換為明文)")
      end
    end
  end

  def down
    # Cannot reverse this migration as original encrypted content is lost
    raise ActiveRecord::IrreversibleMigration, "Cannot restore encrypted content"
  end
end
