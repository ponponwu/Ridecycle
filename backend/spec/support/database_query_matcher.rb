# Custom RSpec matcher to check database query count
# Usage: expect { some_code }.to make_database_queries(count: 2)

RSpec::Matchers.define :make_database_queries do |expected|
  supports_block_expectations

  match do |block|
    query_count = 0
    
    # Subscribe to SQL queries
    subscription = ActiveSupport::Notifications.subscribe('sql.active_record') do |*args|
      event = ActiveSupport::Notifications::Event.new(*args)
      # Skip schema queries, SAVEPOINT, and other non-data queries
      unless event.payload[:name] =~ /SCHEMA|SAVEPOINT|ROLLBACK|COMMIT|BEGIN/
        query_count += 1
      end
    end
    
    begin
      block.call
    ensure
      ActiveSupport::Notifications.unsubscribe(subscription)
    end
    
    if expected.is_a?(Hash) && expected[:count]
      @actual_count = query_count
      @expected_count = expected[:count]
      query_count == expected[:count]
    elsif expected.is_a?(Hash) && expected[:maximum]
      @actual_count = query_count
      @expected_maximum = expected[:maximum]
      query_count <= expected[:maximum]
    else
      raise ArgumentError, "Expected format: make_database_queries(count: n) or make_database_queries(maximum: n)"
    end
  end

  failure_message do |block|
    if @expected_count
      "expected #{@expected_count} database queries, but got #{@actual_count}"
    elsif @expected_maximum
      "expected at most #{@expected_maximum} database queries, but got #{@actual_count}"
    end
  end

  failure_message_when_negated do |block|
    if @expected_count
      "expected not to make exactly #{@expected_count} database queries, but did"
    elsif @expected_maximum
      "expected to make more than #{@expected_maximum} database queries, but made #{@actual_count}"
    end
  end

  description do
    if @expected_count
      "make exactly #{@expected_count} database queries"
    elsif @expected_maximum
      "make at most #{@expected_maximum} database queries"
    end
  end
end 