# frozen_string_literal: true

# Query Logging Configuration for Rails 7
# This initializer sets up enhanced query logging and performance monitoring

Rails.application.configure do
  # Only enable in development and test environments
  if Rails.env.development? || Rails.env.test?
    
    # Configure query log tags with custom context
    config.active_record.query_log_tags = [
      :application,
      :controller,
      :action,
      :job,
      # Custom tags for better context
      {
        request_id: ->(context) { 
          context[:controller]&.request&.request_id&.first(8)
        },
        user_id: ->(context) { 
          # Safely access current_user without violating method visibility
          controller = context[:controller]
          if controller && controller.respond_to?(:current_user)
            begin
              # Use send to access protected method safely, with error handling
              user = controller.send(:current_user)
              user&.id
            rescue NoMethodError, StandardError
              # Return nil if current_user is not accessible or fails
              nil
            end
          else
            nil
          end
        },
        ip: ->(context) {
          context[:controller]&.request&.remote_ip
        },
        method: ->(context) {
          context[:controller]&.request&.method
        }
      }
    ]

    # Enable query log tags
    config.active_record.query_log_tags_enabled = true
    
    # Set query log tag format
    config.active_record.query_log_tags_format = :sqlcommenter
    
    # Subscribe to SQL events for custom logging
    ActiveSupport::Notifications.subscribe('sql.active_record') do |name, start, finish, id, payload|
      duration = (finish - start) * 1000 # Convert to milliseconds
      
      # Log slow queries (over 100ms in development, 50ms in test)
      slow_query_threshold = Rails.env.test? ? 50 : 100
      
      if duration > slow_query_threshold
        Rails.logger.warn "🐌 Slow Query Alert: #{duration.round(2)}ms"
        Rails.logger.warn "SQL: #{payload[:sql]}"
        Rails.logger.warn "Binds: #{payload[:binds]}" if payload[:binds].present?
        Rails.logger.warn "Caller: #{Rails.backtrace_cleaner.clean(caller)[0..2].join('\n')}"
        Rails.logger.warn "─" * 80
      end
      
      # Log all queries in test environment for debugging
      if Rails.env.test? && ENV['LOG_QUERIES'] == 'true'
        Rails.logger.debug "🔍 Query: #{duration.round(2)}ms - #{payload[:sql]}"
      end
    end

    # Subscribe to strict loading violations
    ActiveSupport::Notifications.subscribe('strict_loading_violation.active_record') do |name, start, finish, id, payload|
      Rails.logger.error "🚫 Strict Loading Violation Detected!"
      Rails.logger.error "Model: #{payload[:owner]}"
      Rails.logger.error "Association: #{payload[:reflection]}"
      Rails.logger.error "Caller: #{Rails.backtrace_cleaner.clean(caller)[0..3].join('\n')}"
      Rails.logger.error "═" * 80
    end

    # Log query count per request in development
    if Rails.env.development?
      ActiveSupport::Notifications.subscribe('process_action.action_controller') do |name, start, finish, id, payload|
        queries_count = Thread.current[:query_count] || 0
        duration = finish - start
        
        if queries_count > 10 # Alert if more than 10 queries per request
          Rails.logger.warn "⚠️  High Query Count Alert: #{queries_count} queries in #{duration.round(2)}ms"
          Rails.logger.warn "Controller: #{payload[:controller]}##{payload[:action]}"
          Rails.logger.warn "─" * 60
        end
        
        # Reset counter
        Thread.current[:query_count] = 0
      end

      # Count queries per request
      ActiveSupport::Notifications.subscribe('sql.active_record') do |name, start, finish, id, payload|
        Thread.current[:query_count] = (Thread.current[:query_count] || 0) + 1
      end
    end
  end
end

# Custom logger methods for better query debugging
module QueryLoggingHelpers
  def log_query_performance(description = "Query performance")
    start_time = Time.current
    start_queries = Thread.current[:query_count] || 0
    
    result = yield
    
    end_time = Time.current
    end_queries = Thread.current[:query_count] || 0
    
    duration = ((end_time - start_time) * 1000).round(2)
    query_count = end_queries - start_queries
    
    Rails.logger.info "📊 #{description}: #{duration}ms, #{query_count} queries"
    
    result
  end
end

# Include helper methods in controllers
if defined?(ActionController::Base)
  ActionController::Base.include QueryLoggingHelpers
end

# Include helper methods in jobs
if defined?(ActiveJob::Base)
  ActiveJob::Base.include QueryLoggingHelpers
end