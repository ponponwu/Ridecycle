# app/services/bicycle_creation_service.rb

# Service Object for creating bicycles
# Follows Single Responsibility Principle by handling only bicycle creation logic
class BicycleCreationService
  # @param user [User] The user creating the bicycle
  # @param bicycle_params [ActionController::Parameters] The bicycle parameters
  # @param photo_files [Array<ActionDispatch::Http::UploadedFile>] Optional photo files
  def initialize(user, bicycle_params, photo_files = [])
    @user = user
    @bicycle_params = bicycle_params
    @photo_files = photo_files
  end

  # Creates a new bicycle with photos
  # @return [Bicycle] The created bicycle
  # @raise [ActiveRecord::RecordInvalid] If bicycle validation fails
  def call
    ActiveRecord::Base.transaction do
      create_bicycle
      attach_photos if @photo_files.present?
      @bicycle
    end
  rescue ActiveRecord::RecordInvalid => e
    Rails.logger.error "BicycleCreationService failed: #{e.message}"
    raise e
  end

  # Checks if the service can be executed
  # @return [Boolean] True if all required parameters are present
  def valid?
    @user.present? && @bicycle_params.present?
  end

  private

  # Creates the bicycle record
  # @return [Bicycle] The created bicycle
  def create_bicycle
    @bicycle = @user.bicycles.build(processed_params)
    @bicycle.save!
    @bicycle
  end

  # Attaches photos to the bicycle
  # @return [void]
  def attach_photos
    @photo_files.each do |photo_file|
      @bicycle.photos.attach(photo_file) if photo_file.present?
    end
  end

  # Processes and cleans the bicycle parameters
  # @return [Hash] Processed parameters
  def processed_params
    params = @bicycle_params.to_h
    
    # Process specifications if present
    if params[:specifications].is_a?(String)
      begin
        params[:specifications] = JSON.parse(params[:specifications])
      rescue JSON::ParserError
        Rails.logger.warn "Failed to parse specifications JSON: #{params[:specifications]}"
        params[:specifications] = {}
      end
    end
    
    params
  end
end 