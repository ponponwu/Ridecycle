# Use this file to easily define all of your cron jobs.
#
# It's helpful, but not entirely necessary to understand cron before proceeding.
# http://en.wikipedia.org/wiki/Cron

# Set environment variables
set :environment, 'production'
set :output, '/var/log/cron.log'

# Schedule to run every day at midnight to cancel expired orders
every 1.day, at: '12:00 am' do
  runner "CancelExpiredOrdersJob.perform_now"
end

# Schedule to run every week at 1:00 am to cleanup expired refresh tokens
every 1.week, at: '1:00 am' do
  runner "CleanupExpiredRefreshTokensJob.perform_now"
end

# Optional: Run cleanup every week to remove old payment proofs
every 1.week, at: '2:00 am' do
  runner "CleanupOldFilesJob.perform_now" # This job would need to be created separately if needed
end

# Learn more: http://github.com/javan/whenever
