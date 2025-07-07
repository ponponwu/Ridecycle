class AddCleanupIndexesToRefreshTokens < ActiveRecord::Migration[7.1]
  def change
    # Add index on expires_at for efficient cleanup of expired tokens
    add_index :refresh_tokens, :expires_at
    
    # Add index on revoked_at for efficient cleanup of revoked tokens
    add_index :refresh_tokens, :revoked_at
    
    # Add composite index for cleanup operations that filter by both date and status
    add_index :refresh_tokens, [:expires_at, :revoked_at]
  end
end
