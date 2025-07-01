module BicyclePreloader
  extend ActiveSupport::Concern

  private

  # Defines standard includes for bicycle queries to prevent N+1 issues.
  # This can be shared across multiple controllers.
  def standard_bicycle_includes(context = 'detail')
    base_associations = [
      :user,             # for seller info
      :brand,            # for brand info
      :bicycle_model,    # for model info
      :transmission      # for transmission info
    ]
    
    # 根據上下文決定 ActiveStorage 預載策略
    photos_include = case context
    when 'list'
      # 列表頁面：只預載 attachments 和 blobs
      { photos_attachments: :blob }
    else # 'detail' or default
      # 詳細頁面：預載所有變體
      { photos_attachments: { blob: :variant_records } }
    end
    
    base_associations + [photos_include]
  end
  
  # 列表頁面專用的輕量級預載
  def list_bicycle_includes
    standard_bicycle_includes('list')
  end
  
  # 詳細頁面專用的完整預載
  def detail_bicycle_includes
    standard_bicycle_includes('detail')
  end
end 