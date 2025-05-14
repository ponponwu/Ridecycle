# app/services/image_upload_service.rb
class ImageUploadService
  # @param record: The ActiveRecord model instance (e.g., a Bicycle instance)
  # @param files: The uploaded file(s) from the controller params (e.g., params[:bicycle][:photos])
  #               This can be a single file or an array of files.
  def self.call(record:, files:)
    unless record.respond_to?(:photos) && record.photos.respond_to?(:attach)
      return { success: false, errors: ["Record does not support photo attachments or photos attribute is misconfigured."] }
    end

    if files.present?
      begin
        record.photos.attach(files)
        # Active Storage 會根據環境配置自動將檔案儲存到本地磁碟或 GCS
        return { success: true, record: record }
      rescue StandardError => e
        Rails.logger.error "ImageUploadService Error during attachment: #{e.message}\nBacktrace: #{e.backtrace.join("\n")}"
        return { success: false, errors: ["Failed to attach files: #{e.message}"] }
      end
    else
      # 如果沒有提供檔案，可以視為成功（沒有執行任何操作）或失敗，取決於您的業務邏輯
      # 這裡我們假設沒有檔案不是一個錯誤，但可以記錄一下
      Rails.logger.info "ImageUploadService: No files provided for record ##{record.id if record.persisted?}"
      return { success: true, record: record, message: "No files provided to attach." }
    end
  end

  # 如果您需要一個方法來移除圖片，也可以加在這裡
  # def self.remove(record:, attachment_id:)
  #   attachment = record.photos.find_by(id: attachment_id)
  #   if attachment
  #     attachment.purge # 或者 attachment.purge_later for background job
  #     return { success: true, message: "Attachment removed." }
  #   else
  #     return { success: false, errors: ["Attachment not found."] }
  #   end
  # rescue StandardError => e
  #   Rails.logger.error "ImageUploadService Error during removal: #{e.message}"
  #   return { success: false, errors: ["Failed to remove attachment: #{e.message}"] }
  # end
end 