require 'rails_helper'

RSpec.describe RefreshToken, 'cleanup methods', type: :model do
  let(:user) { create(:user) }

  describe '.cleanup_expired_tokens!' do
    let!(:old_expired_token) do
      create(:refresh_token, 
             user: user, 
             expires_at: 35.days.ago, 
             created_at: 35.days.ago)
    end
    
    let!(:recent_expired_token) do
      create(:refresh_token, 
             user: user, 
             expires_at: 25.days.ago, 
             created_at: 25.days.ago)
    end
    
    let!(:active_token) do
      create(:refresh_token, 
             user: user, 
             expires_at: 6.days.from_now)
    end

    it 'removes expired tokens older than specified days' do
      expect {
        RefreshToken.cleanup_expired_tokens!(30)
      }.to change { RefreshToken.count }.by(-1)
      
      expect(RefreshToken.exists?(old_expired_token.id)).to be_falsey
      expect(RefreshToken.exists?(recent_expired_token.id)).to be_truthy
      expect(RefreshToken.exists?(active_token.id)).to be_truthy
    end

    it 'returns count of cleaned tokens' do
      count = RefreshToken.cleanup_expired_tokens!(30)
      expect(count).to eq(1)
    end

    it 'does not remove tokens if none match criteria' do
      expect {
        RefreshToken.cleanup_expired_tokens!(40)
      }.not_to change { RefreshToken.count }
    end

    it 'logs cleanup information' do
      expect(Rails.logger).to receive(:info).with(/清理 1 個過期超過 30 天的 refresh tokens/)
      RefreshToken.cleanup_expired_tokens!(30)
    end
  end

  describe '.cleanup_revoked_tokens!' do
    let!(:old_revoked_token) do
      create(:refresh_token, 
             user: user, 
             expires_at: 6.days.from_now,
             revoked_at: 10.days.ago)
    end
    
    let!(:recent_revoked_token) do
      create(:refresh_token, 
             user: user, 
             expires_at: 6.days.from_now,
             revoked_at: 5.days.ago)
    end
    
    let!(:active_token) do
      create(:refresh_token, 
             user: user, 
             expires_at: 6.days.from_now)
    end

    it 'removes revoked tokens older than specified days' do
      expect {
        RefreshToken.cleanup_revoked_tokens!(7)
      }.to change { RefreshToken.count }.by(-1)
      
      expect(RefreshToken.exists?(old_revoked_token.id)).to be_falsey
      expect(RefreshToken.exists?(recent_revoked_token.id)).to be_truthy
      expect(RefreshToken.exists?(active_token.id)).to be_truthy
    end

    it 'returns count of cleaned tokens' do
      count = RefreshToken.cleanup_revoked_tokens!(7)
      expect(count).to eq(1)
    end

    it 'does not remove active tokens' do
      expect {
        RefreshToken.cleanup_revoked_tokens!(1)
      }.not_to change { active_token.reload }
    end

    it 'logs cleanup information' do
      expect(Rails.logger).to receive(:info).with(/清理 1 個撤銷超過 7 天的 refresh tokens/)
      RefreshToken.cleanup_revoked_tokens!(7)
    end
  end

  describe '.cleanup_stats' do
    let!(:active_token) do
      create(:refresh_token, 
             user: user, 
             expires_at: 6.days.from_now)
    end
    
    let!(:expired_token) do
      create(:refresh_token, 
             user: user, 
             expires_at: 1.day.ago)
    end
    
    let!(:revoked_token) do
      create(:refresh_token, 
             user: user, 
             expires_at: 6.days.from_now,
             revoked_at: 1.day.ago)
    end
    
    let!(:old_expired_token) do
      create(:refresh_token, 
             user: user, 
             expires_at: 35.days.ago, 
             created_at: 35.days.ago)
    end
    
    let!(:old_revoked_token) do
      create(:refresh_token, 
             user: user, 
             expires_at: 6.days.from_now,
             revoked_at: 10.days.ago)
    end

    it 'returns comprehensive statistics' do
      stats = RefreshToken.cleanup_stats
      
      expect(stats[:total_tokens]).to eq(5)
      expect(stats[:active_tokens]).to eq(1)
      expect(stats[:expired_tokens]).to eq(2) # expired_token + old_expired_token
      expect(stats[:revoked_tokens]).to eq(2) # revoked_token + old_revoked_token
      expect(stats[:old_expired_tokens]).to eq(1) # old_expired_token
      expect(stats[:old_revoked_tokens]).to eq(1) # old_revoked_token
    end

    it 'returns hash with expected keys' do
      stats = RefreshToken.cleanup_stats
      
      expected_keys = [
        :total_tokens, 
        :active_tokens, 
        :expired_tokens, 
        :revoked_tokens, 
        :old_expired_tokens, 
        :old_revoked_tokens
      ]
      
      expect(stats.keys).to match_array(expected_keys)
    end
  end
end