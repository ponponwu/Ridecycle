# frozen_string_literal: true

# Parallel Testing Configuration for Rails 7
# This initializer optimizes test execution across multiple processes

if Rails.env.test?
  # Configure parallel testing based on system capabilities
  processor_count = Etc.nprocessors
  parallel_workers = ENV.fetch('PARALLEL_WORKERS', [processor_count - 1, 2].max).to_i

  Rails.application.configure do
    # Set parallel testing configuration
    config.active_support.test_parallelization_threshold = 50
    config.active_support.test_parallelization_with_processes = parallel_workers
    
    # Configure test database naming for parallel execution
    if ENV['PARALLEL_TESTS']
      config.active_support.test_parallelization_first_worker = ENV.fetch('TEST_ENV_NUMBER', '').blank?
    end
  end

  # Parallel testing hooks for setup and teardown
  class ParallelTestingSetup
    def self.setup_worker(worker_number)
      # Worker-specific setup
      Rails.logger.info "🔧 Setting up parallel test worker #{worker_number}"
      
      # Configure worker-specific Active Storage settings
      if defined?(ActiveStorage)
        ActiveStorage::Blob.service = ActiveStorage::Service.configure(
          :test, Rails.application.config.active_storage.service_configurations
        )
      end
      
      # Configure worker-specific cache
      Rails.cache = ActiveSupport::Cache::MemoryStore.new
      
      # Reset any shared state
      clear_shared_state
    end

    def self.teardown_worker(worker_number)
      # Worker-specific cleanup
      Rails.logger.info "🧹 Cleaning up parallel test worker #{worker_number}"
      
      # Clear any temporary files created by this worker
      cleanup_worker_files(worker_number)
    end

    private

    def self.clear_shared_state
      # Clear any application-level shared state
      # This prevents test pollution between parallel workers
      Thread.current[:query_count] = 0
      
      # Clear any caches
      Rails.cache.clear if Rails.cache.respond_to?(:clear)
    end

    def self.cleanup_worker_files(worker_number)
      # Clean up any worker-specific temporary files
      temp_dir = Rails.root.join("tmp", "parallel_test_worker_#{worker_number}")
      FileUtils.rm_rf(temp_dir) if temp_dir.exist?
    end
  end

  # Hook into Rails parallel testing
  if defined?(Minitest) && Minitest.respond_to?(:parallel_executor)
    # Configure Minitest parallel execution
    Minitest.parallel_executor.start_worker = proc do |worker_number|
      ParallelTestingSetup.setup_worker(worker_number)
    end

    Minitest.parallel_executor.shutdown_worker = proc do |worker_number|
      ParallelTestingSetup.teardown_worker(worker_number)
    end
  end

  # RSpec parallel configuration (if using RSpec)
  if defined?(RSpec)
    RSpec.configure do |config|
      config.before(:suite) do
        # Only run on the first worker to avoid duplicate setup
        if ENV.fetch('TEST_ENV_NUMBER', '').blank?
          Rails.logger.info "🚀 Starting parallel test suite"
        end
      end

      config.after(:suite) do
        # Cleanup after each worker
        worker_number = ENV.fetch('TEST_ENV_NUMBER', '1').to_i
        ParallelTestingSetup.teardown_worker(worker_number)
      end
    end
  end

  # Database configuration for parallel testing
  module ParallelDatabaseSetup
    def self.configure_parallel_databases
      return unless ENV['PARALLEL_TESTS']

      worker_number = ENV.fetch('TEST_ENV_NUMBER', '').presence || '1'
      
      # Configure database for each worker
      ActiveRecord::Base.configurations.configs_for(env_name: 'test').each do |config|
        if config.name == 'primary'
          # Modify database name for parallel workers
          original_database = config.database
          parallel_database = "#{original_database}_#{worker_number}"
          
          # Update configuration
          config.instance_variable_set(:@database, parallel_database)
        end
      end
    end
  end

  # Auto-configure parallel databases
  ParallelDatabaseSetup.configure_parallel_databases

  Rails.logger.info "🔄 Parallel testing configured with #{parallel_workers} workers"
end