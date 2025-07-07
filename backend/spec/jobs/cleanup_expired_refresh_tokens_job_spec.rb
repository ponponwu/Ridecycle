require 'rails_helper'

RSpec.describe CleanupExpiredRefreshTokensJob, type: :job do
  let(:user) { create(:user) }
  
  describe '#perform' do
    context 'with expired tokens' do
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

      it 'cleans up expired tokens older than retention period' do
        expect {
          described_class.new.perform(30, 7)
        }.to change { RefreshToken.count }.by(-1)
        
        expect(RefreshToken.exists?(old_expired_token.id)).to be_falsey
        expect(RefreshToken.exists?(recent_expired_token.id)).to be_truthy
        expect(RefreshToken.exists?(active_token.id)).to be_truthy
      end

      it 'returns correct cleanup statistics' do
        result = described_class.new.perform(30, 7)
        
        expect(result[:expired_tokens_cleaned]).to eq(1)
        expect(result[:revoked_tokens_cleaned]).to eq(0)
        expect(result[:total_cleaned]).to eq(1)
        expect(result[:cleanup_stats]).to be_a(Hash)
      end
    end

    context 'with revoked tokens' do
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

      it 'cleans up revoked tokens older than retention period' do
        expect {
          described_class.new.perform(30, 7)
        }.to change { RefreshToken.count }.by(-1)
        
        expect(RefreshToken.exists?(old_revoked_token.id)).to be_falsey
        expect(RefreshToken.exists?(recent_revoked_token.id)).to be_truthy
        expect(RefreshToken.exists?(active_token.id)).to be_truthy
      end
    end

    context 'with mixed token states' do
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
      
      let!(:active_token) do
        create(:refresh_token, 
               user: user, 
               expires_at: 6.days.from_now)
      end

      it 'cleans up both expired and revoked tokens' do
        expect {
          described_class.new.perform(30, 7)
        }.to change { RefreshToken.count }.by(-2)
        
        expect(RefreshToken.exists?(old_expired_token.id)).to be_falsey
        expect(RefreshToken.exists?(old_revoked_token.id)).to be_falsey
        expect(RefreshToken.exists?(active_token.id)).to be_truthy
      end

      it 'returns correct total cleanup statistics' do
        result = described_class.new.perform(30, 7)
        
        expect(result[:expired_tokens_cleaned]).to eq(1)
        expect(result[:revoked_tokens_cleaned]).to eq(1)
        expect(result[:total_cleaned]).to eq(2)
      end
    end

    context 'with no tokens to clean' do
      let!(:active_token) do
        create(:refresh_token, 
               user: user, 
               expires_at: 6.days.from_now)
      end

      it 'does not remove any tokens' do
        expect {
          described_class.new.perform(30, 7)
        }.not_to change { RefreshToken.count }
      end

      it 'returns zero cleanup counts' do
        result = described_class.new.perform(30, 7)
        
        expect(result[:expired_tokens_cleaned]).to eq(0)
        expect(result[:revoked_tokens_cleaned]).to eq(0)
        expect(result[:total_cleaned]).to eq(0)
      end
    end

    context 'with custom retention periods' do
      let!(:token_40_days_old) do
        create(:refresh_token, 
               user: user, 
               expires_at: 40.days.ago, 
               created_at: 40.days.ago)
      end
      
      let!(:token_20_days_old) do
        create(:refresh_token, 
               user: user, 
               expires_at: 20.days.ago, 
               created_at: 20.days.ago)
      end

      it 'uses custom retention periods correctly' do
        # Clean tokens older than 25 days
        expect {
          described_class.new.perform(25, 7)
        }.to change { RefreshToken.count }.by(-1)
        
        expect(RefreshToken.exists?(token_40_days_old.id)).to be_falsey
        expect(RefreshToken.exists?(token_20_days_old.id)).to be_truthy
      end
    end
  end
end