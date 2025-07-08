# frozen_string_literal: true

# Advanced Logging Configuration for Rails 7
# Enhanced logging with structured output, tagging, and performance insights

# Custom log formatter for structured logging
class StructuredLogFormatter < Logger::Formatter
  def call(severity, timestamp, progname, message)
    log_entry = {
      timestamp: timestamp.utc.iso8601(3),
      level: severity,
      progname: progname,
      pid: Process.pid,
      thread_id: Thread.current.object_id
    }
    
    # Parse structured messages
    if message.is_a?(Hash)
      log_entry.merge!(message)
    else
      log_entry[:message] = message.to_s
    end
    
    # Add request context if available
    if defined?(Current) && Current.respond_to?(:request_id)
      log_entry[:request_id] = Current.request_id
    end
    
    # Add user context if available
    if defined?(Current) && Current.respond_to?(:user)
      log_entry[:user_id] = Current.user&.id
    end
    
    "#{JSON.generate(log_entry)}\n"
  end
end

# Performance-aware log formatter for development
class DevelopmentLogFormatter < Logger::Formatter
  SEVERITY_COLORS = {
    'DEBUG' => :cyan,
    'INFO'  => :green,
    'WARN'  => :yellow,
    'ERROR' => :red,
    'FATAL' => :magenta
  }.freeze
  
  def call(severity, timestamp, progname, message)
    color = SEVERITY_COLORS[severity] || :default
    
    formatted_time = timestamp.strftime('%H:%M:%S.%3N')
    pid_thread = "[#{Process.pid}-#{Thread.current.object_id.to_s(16)}]"
    
    # Add emoji indicators for different types of messages
    emoji = case severity
            when 'ERROR', 'FATAL' then '❌'
            when 'WARN' then '⚠️ '
            when 'INFO' then 'ℹ️ '
            when 'DEBUG' then '🔍'
            else ''
            end
    
    # Color the severity if terminal supports it
    colored_severity = if $stdout.tty?
                        case color
                        when :cyan then "\e[36m#{severity}\e[0m"
                        when :green then "\e[32m#{severity}\e[0m"
                        when :yellow then "\e[33m#{severity}\e[0m"
                        when :red then "\e[31m#{severity}\e[0m"
                        when :magenta then "\e[35m#{severity}\e[0m"
                        else severity
                        end
                      else
                        severity
                      end
    
    "#{formatted_time} #{pid_thread} #{colored_severity} #{emoji} #{message}\n"
  end
end

# Configure logging based on environment
Rails.application.configure do
  if Rails.env.production?
    # Production: Structured JSON logging
    config.log_formatter = StructuredLogFormatter.new
    config.log_level = :info
    
    # Configure log rotation
    config.logger = ActiveSupport::Logger.new(
      Rails.root.join('log', 'production.log'),
      'daily', # Rotate daily
      50.megabytes
    )
    
    # Reduce noise in production logs
    config.filter_parameters += [:password, :password_confirmation, :secret, :token, :key, :salt, :bank_account_number]
    
  elsif Rails.env.development?
    # Development: Enhanced readable logging
    config.log_formatter = DevelopmentLogFormatter.new
    config.log_level = :debug
    
    # Enable detailed query logging
    config.active_record.verbose_query_logs = true
    
  else # test environment
    # Test: Minimal logging for speed
    config.log_level = :warn
    config.logger = ActiveSupport::Logger.new(Rails.root.join('log', 'test.log'))
  end
  
  # Global logging configuration
  config.log_tags = [
    :request_id,
    -> request { request.remote_ip },
    -> request { "#{request.method} #{request.path}" }
  ]
end

# Custom logging modules
module ApplicationLogging
  extend ActiveSupport::Concern
  
  included do
    # Add class-level logger with context
    def self.logger
      @logger ||= Rails.logger.tagged(name)
    end
  end
  
  # Instance-level logging with context
  def log_with_context(level, message, **metadata)
    context = {
      class: self.class.name,
      method: caller_locations(1, 1)[0].label
    }
    
    context.merge!(metadata)
    
    if message.is_a?(Hash)
      Rails.logger.send(level, context.merge(message))
    else
      Rails.logger.send(level, context.merge(message: message))
    end
  end
  
  # Performance logging helpers
  def log_performance(description, level: :info)
    start_time = Time.current
    start_memory = memory_usage_mb
    
    result = yield
    
    end_time = Time.current
    end_memory = memory_usage_mb
    
    duration_ms = ((end_time - start_time) * 1000).round(2)
    memory_diff = (end_memory - start_memory).round(2)
    
    log_with_context(level, {
      event: 'performance',
      description: description,
      duration_ms: duration_ms,
      memory_diff_mb: memory_diff,
      timestamp: start_time.iso8601(3)
    })
    
    result
  end
  
  private
  
  def memory_usage_mb
    `ps -o rss= -p #{Process.pid}`.to_i / 1024.0
  rescue
    0.0
  end
end

# Business logic logging
module BusinessLogic
  def self.log_user_action(user, action, resource = nil, metadata = {})
    Rails.logger.info({
      event: 'user_action',
      user_id: user&.id,
      action: action,
      resource_type: resource&.class&.name,
      resource_id: resource&.id,
      metadata: metadata,
      timestamp: Time.current.iso8601(3)
    })
  end
  
  def self.log_business_event(event_type, data = {})
    Rails.logger.info({
      event: 'business_event',
      event_type: event_type,
      data: data,
      timestamp: Time.current.iso8601(3)
    })
  end
  
  def self.log_security_event(event_type, user = nil, ip_address = nil, metadata = {})
    Rails.logger.warn({
      event: 'security_event',
      event_type: event_type,
      user_id: user&.id,
      ip_address: ip_address,
      metadata: metadata,
      timestamp: Time.current.iso8601(3)
    })
  end
end

# Error tracking and logging
module ErrorLogging
  def self.log_error(error, context = {})
    Rails.logger.error({
      event: 'error',
      error_class: error.class.name,
      error_message: error.message,
      backtrace: error.backtrace&.first(10),
      context: context,
      timestamp: Time.current.iso8601(3)
    })
  end
  
  def self.log_performance_issue(issue_type, details = {})
    Rails.logger.warn({
      event: 'performance_issue',
      issue_type: issue_type,
      details: details,
      timestamp: Time.current.iso8601(3)
    })
  end
end

# API request/response logging
class ApiLoggingMiddleware
  def initialize(app)
    @app = app
  end
  
  def call(env)
    request = ActionDispatch::Request.new(env)
    start_time = Time.current
    
    # Skip logging for health checks and assets
    return @app.call(env) if skip_logging?(request.path)
    
    Rails.logger.info({
      event: 'api_request_start',
      method: request.method,
      path: request.path,
      user_agent: request.user_agent,
      ip: request.remote_ip,
      timestamp: start_time.iso8601(3)
    })
    
    status, headers, response = @app.call(env)
    
    end_time = Time.current
    duration_ms = ((end_time - start_time) * 1000).round(2)
    
    Rails.logger.info({
      event: 'api_request_end',
      method: request.method,
      path: request.path,
      status: status,
      duration_ms: duration_ms,
      timestamp: end_time.iso8601(3)
    })
    
    [status, headers, response]
  rescue => error
    Rails.logger.error({
      event: 'api_request_error',
      method: request.method,
      path: request.path,
      error: error.message,
      timestamp: Time.current.iso8601(3)
    })
    
    raise error
  end
  
  private
  
  def skip_logging?(path)
    ['/health', '/assets/', '/favicon.ico'].any? { |skip_path| path.start_with?(skip_path) }
  end
end

# Add middleware in development and production
unless Rails.env.test?
  Rails.application.config.middleware.use ApiLoggingMiddleware
end

# Include logging helpers in base classes
if defined?(ApplicationRecord)
  ApplicationRecord.include ApplicationLogging
end

if defined?(ActionController::Base)
  ActionController::Base.include ApplicationLogging
end

if defined?(ActiveJob::Base)
  ActiveJob::Base.include ApplicationLogging
end

# Log application startup
Rails.logger.info({
  event: 'application_startup',
  environment: Rails.env,
  ruby_version: RUBY_VERSION,
  rails_version: Rails.version,
  timestamp: Time.current.iso8601(3)
})

Rails.logger.info "📝 Advanced logging initialized for #{Rails.env} environment"