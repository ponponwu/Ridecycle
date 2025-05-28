module JsonApiResponse
  extend ActiveSupport::Concern

  private

  # 統一的 JSON:API 單一資源回應
  # @param resource [ActiveRecord::Base] 要序列化的資源
  # @param serializer [Class] 序列化器類別
  # @param options [Hash] 額外選項
  # @param status [Symbol] HTTP 狀態碼
  def render_jsonapi_resource(resource, serializer: nil, options: {}, status: :ok)
    serializer_class = serializer || "#{resource.class.name}Serializer".constantize
    
    render json: serializer_class.new(resource, options).serializable_hash, status: status
  end

  # 統一的 JSON:API 集合回應（帶分頁）
  # @param collection [ActiveRecord::Relation] 要序列化的集合
  # @param serializer [Class] 序列化器類別
  # @param meta [Hash] 元資料（分頁資訊等）
  # @param options [Hash] 額外選項
  # @param status [Symbol] HTTP 狀態碼
  def render_jsonapi_collection(collection, serializer: nil, meta: {}, options: {}, status: :ok)
    serializer_class = serializer || "#{collection.first&.class&.name}Serializer".constantize
    
    serialized_data = serializer_class.new(collection, options).serializable_hash
    
    response_data = {
      data: serialized_data[:data],
      meta: meta
    }
    
    # 如果有 included 資源，也包含進去
    response_data[:included] = serialized_data[:included] if serialized_data[:included]
    
    render json: response_data, status: status
  end

  # 統一的 JSON:API 錯誤回應
  # @param errors [Array<String>, String] 錯誤訊息
  # @param status [Symbol] HTTP 狀態碼
  # @param title [String] 錯誤標題
  def render_jsonapi_errors(errors, status: :unprocessable_entity, title: nil)
    error_array = Array(errors).map.with_index do |error, index|
      {
        id: (index + 1).to_s,
        status: Rack::Utils::SYMBOL_TO_STATUS_CODE[status].to_s,
        title: title || status.to_s.humanize,
        detail: error
      }
    end

    render json: { errors: error_array }, status: status
  end

  # 統一的 JSON:API 成功回應（無資料）
  # @param message [String] 成功訊息
  # @param meta [Hash] 額外元資料
  # @param status [Symbol] HTTP 狀態碼
  def render_jsonapi_success(message: 'Success', meta: {}, status: :ok)
    render json: {
      data: {
        type: 'success',
        id: '1',
        attributes: {
          message: message
        }
      },
      meta: meta.merge(timestamp: Time.current.iso8601)
    }, status: status
  end

  # 統一的 JSON:API 自定義回應
  # @param type [String] 資源類型
  # @param id [String] 資源 ID
  # @param attributes [Hash] 屬性
  # @param meta [Hash] 元資料
  # @param status [Symbol] HTTP 狀態碼
  def render_jsonapi_custom(type:, id:, attributes: {}, meta: {}, status: :ok)
    render json: {
      data: {
        type: type,
        id: id.to_s,
        attributes: attributes
      },
      meta: meta.merge(timestamp: Time.current.iso8601)
    }, status: status
  end
end 