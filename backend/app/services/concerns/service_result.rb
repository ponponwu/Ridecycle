# frozen_string_literal: true

# Service result pattern for standardizing service responses
# Provides success and failure methods for consistent service responses
module ServiceResult
  extend ActiveSupport::Concern

  # Represents a successful service operation
  class Success
    attr_reader :data, :message

    def initialize(data = nil, message = nil)
      @data = data
      @message = message
    end

    def success?
      true
    end
    

    def failure?
      false
    end

    def errors
      []
    end

    def status
      :ok
    end
  end

  # Represents a failed service operation
  class Failure
    attr_reader :errors, :status, :message

    def initialize(errors = [], status = :unprocessable_entity, message = nil)
      @errors = Array(errors)
      @status = status
      @message = message
    end

    def success?
      false
    end

    def failure?
      true
    end

    def data
      nil
    end
  end

  private

  # Creates a success result
  # @param data [Object] The successful operation data
  # @param message [String] Optional success message
  # @return [ServiceResult::Success]
  def success(data = nil, message = nil)
    Success.new(data, message)
  end

  # Creates a failure result
  # @param errors [Array<String>, String] Error messages
  # @param status [Symbol] HTTP status symbol
  # @param message [String] Optional failure message
  # @return [ServiceResult::Failure]
  def failure(errors = [], status = :unprocessable_entity, message = nil)
    Failure.new(errors, status, message)
  end
end