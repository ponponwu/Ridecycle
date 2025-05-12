class CreateRefreshTokens < ActiveRecord::Migration[7.1]
  def change
    create_table :refresh_tokens do |t|
      t.references :user, null: false, foreign_key: true
      t.string :token, null: false # Store a unique identifier or a hash of the token, not the raw JWT if it's long
      t.datetime :expires_at, null: false
      t.datetime :revoked_at # To mark token as revoked
      t.datetime :last_used_at # For rotation: mark as used

      t.timestamps
    end
    add_index :refresh_tokens, :token, unique: true
  end
end
