class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
  
  # Include strict loading concern for all models
  include StrictLoadingConcern
  
  # Global scope for efficient loading with common associations
  scope :with_efficient_includes, -> { all }
end
