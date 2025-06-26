# Query count matcher for testing N+1 queries
RSpec::Matchers.define :exceed_query_limit do |expected|
  supports_block_expectations

  match do |block|
    query_count(&block) > expected
  end

  failure_message do |block|
    "expected block to run more than #{expected} queries, but it ran #{@actual_count}"
  end

  failure_message_when_negated do |block|
    "expected block to run #{expected} or fewer queries, but it ran #{@actual_count}"
  end

  def query_count(&block)
    @actual_count = 0
    counter = lambda { |*args| @actual_count += 1 }
    
    ActiveSupport::Notifications.subscribed(counter, 'sql.active_record', &block)
    @actual_count
  end
end 