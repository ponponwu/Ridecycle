# frozen_string_literal: true

# Performance Monitoring Configuration for Rails 7
# Advanced database and application performance tracking

# Performance monitoring configuration
module PerformanceMonitoring
  class Configuration
    attr_accessor :slow_query_threshold, :n_plus_one_threshold, :memory_threshold
    
    def initialize
      @slow_query_threshold = Rails.env.production? ? 500 : 100 # milliseconds
      @n_plus_one_threshold = 10 # number of queries
      @memory_threshold = 100 # MB
    end
  end
  
  def self.configuration
    @configuration ||= Configuration.new
  end
  
  def self.configure
    yield(configuration)
  end
end

# Configure performance monitoring
PerformanceMonitoring.configure do |config|
  config.slow_query_threshold = ENV.fetch('SLOW_QUERY_THRESHOLD', 100).to_i
  config.n_plus_one_threshold = ENV.fetch('N_PLUS_ONE_THRESHOLD', 10).to_i
  config.memory_threshold = ENV.fetch('MEMORY_THRESHOLD', 100).to_i
end

# Advanced SQL monitoring
class SqlPerformanceMonitor
  SLOW_QUERY_PATTERNS = [
    /SELECT.*FROM.*WHERE.*IN.*\(/i,  # IN queries with many parameters
    /SELECT.*FROM.*ORDER BY.*LIMIT/i, # Unindexed sorting
    /SELECT COUNT\(\*\) FROM/i,       # Count queries without limits
  ].freeze
  
  def self.monitor_query(sql, duration_ms, binds = [])
    config = PerformanceMonitoring.configuration
    
    # Check for slow queries
    if duration_ms > config.slow_query_threshold
      log_slow_query(sql, duration_ms, binds)
    end
    
    # Check for potentially problematic query patterns
    check_query_patterns(sql, duration_ms)
    
    # Track query statistics
    track_query_stats(sql, duration_ms)
  end
  
  private
  
  def self.log_slow_query(sql, duration_ms, binds)
    Rails.logger.warn "🐌 SLOW QUERY: #{duration_ms}ms"
    Rails.logger.warn "SQL: #{sql}"
    Rails.logger.warn "Binds: #{binds.map(&:value).inspect}" if binds.any?
    Rails.logger.warn "Backtrace: #{caller[0..5].join('\n')}"
    Rails.logger.warn "─" * 80
    
    # In development, also log to console
    if Rails.env.development?
      puts "\n🐌 SLOW QUERY ALERT: #{duration_ms}ms"
      puts "SQL: #{sql[0..200]}#{'...' if sql.length > 200}"
    end
  end
  
  def self.check_query_patterns(sql, duration_ms)
    SLOW_QUERY_PATTERNS.each do |pattern|
      if sql.match?(pattern)
        Rails.logger.warn "⚠️  POTENTIALLY SLOW PATTERN: #{pattern.source}"
        Rails.logger.warn "SQL: #{sql[0..200]}#{'...' if sql.length > 200}"
        Rails.logger.warn "Duration: #{duration_ms}ms"
        break
      end
    end
  end
  
  def self.track_query_stats(sql, duration_ms)
    # Store query statistics in thread-local storage
    Thread.current[:query_stats] ||= {
      count: 0,
      total_duration: 0,
      slow_queries: 0
    }
    
    stats = Thread.current[:query_stats]
    stats[:count] += 1
    stats[:total_duration] += duration_ms
    stats[:slow_queries] += 1 if duration_ms > PerformanceMonitoring.configuration.slow_query_threshold
  end
end

# N+1 Query Detection
class NPlusOneDetector
  def self.start_request
    Thread.current[:n_plus_one_queries] = {}
    Thread.current[:query_count] = 0
  end
  
  def self.track_query(sql)
    return unless Thread.current[:n_plus_one_queries]
    
    Thread.current[:query_count] = (Thread.current[:query_count] || 0) + 1
    
    # Extract table name from SQL
    table_match = sql.match(/FROM\s+`?(\w+)`?/i)
    return unless table_match
    
    table_name = table_match[1]
    
    # Track queries by table
    Thread.current[:n_plus_one_queries][table_name] ||= 0
    Thread.current[:n_plus_one_queries][table_name] += 1
  end
  
  def self.end_request(controller_name, action_name)
    return unless Thread.current[:n_plus_one_queries]
    
    config = PerformanceMonitoring.configuration
    total_queries = Thread.current[:query_count] || 0
    
    # Check for potential N+1 queries
    Thread.current[:n_plus_one_queries].each do |table, count|
      if count > config.n_plus_one_threshold
        Rails.logger.warn "🔄 POTENTIAL N+1 QUERY DETECTED"
        Rails.logger.warn "Controller: #{controller_name}##{action_name}"
        Rails.logger.warn "Table: #{table}, Query Count: #{count}"
        Rails.logger.warn "Total Queries: #{total_queries}"
        Rails.logger.warn "─" * 60
      end
    end
    
    # Log high query count requests
    if total_queries > config.n_plus_one_threshold
      Rails.logger.warn "📊 HIGH QUERY COUNT: #{total_queries} queries"
      Rails.logger.warn "Controller: #{controller_name}##{action_name}"
      Rails.logger.warn "Tables: #{Thread.current[:n_plus_one_queries].keys.join(', ')}"
    end
    
    # Clean up thread-local storage
    Thread.current[:n_plus_one_queries] = nil
    Thread.current[:query_count] = nil
  end
end

# Memory Usage Monitoring
class MemoryMonitor
  def self.track_memory_usage(description = "Memory usage")
    before_memory = memory_usage_mb
    
    result = yield
    
    after_memory = memory_usage_mb
    memory_diff = after_memory - before_memory
    
    config = PerformanceMonitoring.configuration
    if memory_diff > config.memory_threshold
      Rails.logger.warn "🧠 HIGH MEMORY USAGE: #{memory_diff}MB increase"
      Rails.logger.warn "Description: #{description}"
      Rails.logger.warn "Before: #{before_memory}MB, After: #{after_memory}MB"
    end
    
    result
  end
  
  private
  
  def self.memory_usage_mb
    # Get memory usage in MB
    if defined?(GetProcessMem)
      GetProcessMem.new.mb
    else
      # Fallback for systems without GetProcessMem
      `ps -o rss= -p #{Process.pid}`.to_i / 1024.0
    end
  rescue
    0.0
  end
end

# Subscribe to Active Record events
if Rails.env.development? || Rails.env.test?
  # SQL Query monitoring
  ActiveSupport::Notifications.subscribe('sql.active_record') do |name, start, finish, id, payload|
    duration_ms = (finish - start) * 1000
    
    # Skip SCHEMA queries and cached queries
    next if payload[:name] == 'SCHEMA' || payload[:cached]
    
    sql = payload[:sql]
    binds = payload[:binds] || []
    
    # Monitor query performance
    SqlPerformanceMonitor.monitor_query(sql, duration_ms, binds)
    
    # Track for N+1 detection
    NPlusOneDetector.track_query(sql)
  end
  
  # Controller action monitoring
  ActiveSupport::Notifications.subscribe('process_action.action_controller') do |name, start, finish, id, payload|
    duration_ms = (finish - start) * 1000
    
    # End N+1 detection for this request
    NPlusOneDetector.end_request(payload[:controller], payload[:action])
    
    # Log request statistics
    stats = Thread.current[:query_stats]
    if stats
      Rails.logger.info "📈 REQUEST STATS: #{payload[:controller]}##{payload[:action]}"
      Rails.logger.info "Duration: #{duration_ms.round(2)}ms"
      Rails.logger.info "Queries: #{stats[:count]}, Total Query Time: #{stats[:total_duration].round(2)}ms"
      Rails.logger.info "Slow Queries: #{stats[:slow_queries]}" if stats[:slow_queries] > 0
      
      # Clear stats
      Thread.current[:query_stats] = nil
    end
  end
  
  # Start N+1 detection for each request
  ActiveSupport::Notifications.subscribe('start_processing.action_controller') do |name, start, finish, id, payload|
    NPlusOneDetector.start_request
  end
end

# Performance helper methods
module PerformanceHelpers
  # Benchmark code execution with detailed metrics
  def benchmark_performance(description = "Code execution")
    start_time = Time.current
    start_memory = defined?(GetProcessMem) ? GetProcessMem.new.mb : 0
    
    result = yield
    
    end_time = Time.current
    end_memory = defined?(GetProcessMem) ? GetProcessMem.new.mb : 0
    
    duration_ms = ((end_time - start_time) * 1000).round(2)
    memory_diff = (end_memory - start_memory).round(2)
    
    Rails.logger.info "⏱️  BENCHMARK: #{description}"
    Rails.logger.info "Time: #{duration_ms}ms, Memory: #{memory_diff}MB"
    
    result
  end
  
  # Track memory usage for a block
  def track_memory(description = "Memory tracking")
    MemoryMonitor.track_memory_usage(description) { yield }
  end
end

# Include helpers in controllers and models
if defined?(ActionController::Base)
  ActionController::Base.include PerformanceHelpers
end

if defined?(ApplicationRecord)
  ApplicationRecord.include PerformanceHelpers
end

Rails.logger.info "📊 Performance monitoring initialized for #{Rails.env} environment"