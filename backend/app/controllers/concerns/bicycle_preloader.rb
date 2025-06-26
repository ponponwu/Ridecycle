module BicyclePreloader
  extend ActiveSupport::Concern

  private

  # Defines standard includes for bicycle queries to prevent N+1 issues.
  # This can be shared across multiple controllers.
  def standard_bicycle_includes
    [
      :user,             # for seller info
      :brand,            # for brand info
      :bicycle_model,    # for model info
      :transmission,     # for transmission info
      { photos_attachments: :blob } # for all photo URLs and variants
    ]
  end
end 