# app/services/bicycle_search_service.rb

# Service Object for searching bicycles
# Follows Single Responsibility Principle by handling only search logic
class BicycleSearchService
  # @param params [Hash] Search parameters
  # @param includes [Array] Associations to preload
  def initialize(params = {}, includes: [])
    @params = params
    # 使用傳入的 includes，如果為空則使用一個基礎的預載
    base_includes = includes.empty? ? [:user, :brand, { photos_attachments: :blob }] : includes
    @query = Bicycle.includes(base_includes)
  end

  # Executes the search and returns paginated results
  # @return [Hash] Hash containing bicycles and pagination info
  def call
    apply_filters
    apply_sorting
    paginate_results
  end

  private

  # Applies all search filters to the query
  # @return [void]
  def apply_filters
    filter_by_search_term
    filter_by_bicycle_type
    filter_by_condition
    filter_by_price_range
    filter_by_location
    filter_by_brand
    filter_by_status
  end

  # Filters by search term in title and description
  # @return [void]
  def filter_by_search_term
    return unless @params[:search].present?
    
    search_term = "%#{@params[:search]}%"
    @query = @query.where(
      "title ILIKE :search OR description ILIKE :search", 
      search: search_term
    )
  end

  # Filters by bicycle type
  # @return [void]
  def filter_by_bicycle_type
    return unless @params[:bicycle_type].present?
    
    types = Array(@params[:bicycle_type])
    @query = @query.where(bicycle_type: types)
  end

  # Filters by bicycle condition
  # @return [void]
  def filter_by_condition
    return unless @params[:condition].present?
    
    conditions = Array(@params[:condition])
    @query = @query.where(condition: conditions)
  end

  # Filters by price range
  # @return [void]
  def filter_by_price_range
    if @params[:price_min].present?
      @query = @query.where("price >= ?", @params[:price_min].to_f)
    end
    
    if @params[:price_max].present? && @params[:price_max].to_f > 0
      @query = @query.where("price <= ?", @params[:price_max].to_f)
    end
  end

  # Filters by location
  # @return [void]
  def filter_by_location
    return unless @params[:location].present?
    
    @query = @query.where("location ILIKE ?", "%#{@params[:location]}%")
  end

  # Filters by brand
  # @return [void]
  def filter_by_brand
    return unless @params[:brand].present?
    
    brand_name = Array(@params[:brand]).first
    @query = @query.joins(:brand).where("brands.name ILIKE ?", "%#{brand_name}%")
  end

  # Filters by status (defaults to available)
  # @return [void]
  def filter_by_status
    # 預設只顯示可購買的自行車，管理員可以透過參數查看其他狀態
    if @params[:status].present?
      @query = @query.where(status: @params[:status])
    else
      @query = @query.available  # 使用 enum scope，只顯示可購買的自行車
    end
  end

  # Applies sorting to the query
  # @return [void]
  def apply_sorting
    case @params[:sort]
    when 'price_low'
      @query = @query.order(price: :asc)
    when 'price_high'
      @query = @query.order(price: :desc)
    when 'popular'
      # Assuming we have a view_count or similar field
      @query = @query.order(created_at: :desc) # Fallback to newest for now
    else # 'newest' or default
      @query = @query.order(created_at: :desc)
    end
  end

  # Paginates the results
  # @return [Hash] Paginated results with metadata
  def paginate_results
    page = @params.fetch(:page, 1).to_i
    limit = @params.fetch(:limit, 20).to_i
    offset = (page - 1) * limit

    total_count = @query.count
    bicycles = @query.offset(offset).limit(limit)

    {
      bicycles: bicycles,
      total_count: total_count,
      current_page: page,
      per_page: limit,
      total_pages: (total_count.to_f / limit).ceil
    }
  end
end 