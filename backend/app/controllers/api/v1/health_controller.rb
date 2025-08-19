class Api::V1::HealthController < ApplicationController
  skip_before_action :authenticate_request, only: [:index]

  def index
    render json: {
      status: 'ok',
      service: 'RideCycle Backend API',
      timestamp: Time.current.iso8601,
      version: '1.0.0',
      message: 'Backend API is running successfully'
    }
  end
end