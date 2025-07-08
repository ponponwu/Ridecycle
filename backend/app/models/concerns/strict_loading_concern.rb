# frozen_string_literal: true

# StrictLoadingConcern provides shared functionality for managing strict loading
# across models to prevent N+1 queries while allowing controlled bypassing when necessary.
#
# This concern helps in:
# - Setting up strict loading rules per model
# - Providing methods to safely bypass strict loading when needed
# - Handling strict loading violations gracefully
module StrictLoadingConcern
  extend ActiveSupport::Concern

  included do
    # Set strict loading mode based on environment
    # In development and test: enforce strict loading
    # In production: log violations but don't raise errors
    if Rails.env.development? || Rails.env.test?
      self.strict_loading_by_default = true
    end
  end

  class_methods do
    # Load records with all commonly needed associations to avoid N+1 queries
    # Override in each model to specify the most common association patterns
    def with_common_includes
      all
    end

    # Load records without strict loading for cases where we know we'll need
    # to access multiple associations dynamically
    def without_strict_loading
      all.strict_loading(false)
    end

    # Find record and load it without strict loading
    def find_without_strict_loading(id)
      find(id).tap { |record| record.strict_loading!(false) }
    end
  end

  # Instance methods for handling strict loading

  # Temporarily disable strict loading for this record
  def with_flexible_loading
    original_strict_loading = strict_loading?
    strict_loading!(false)
    result = yield(self)
    strict_loading!(original_strict_loading)
    result
  rescue => e
    strict_loading!(original_strict_loading)
    raise e
  end

  # Check if this record has strict loading enabled
  def strict_loading?
    strict_loading_enabled?
  end

  # Load specific associations without triggering strict loading violations
  def preload_associations(*associations)
    self.class.preload(associations).find(id)
  end
end