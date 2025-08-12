// src/api/feedbackService.ts
import apiClient from './client'

export interface FeedbackCategory {
  key: string
  name: string
}

export interface CreateFeedbackData {
  subject: string
  content: string
  category: string
}

export interface UpdateFeedbackData {
  subject: string
  content: string
}

export interface FeedbackResponse {
  id: number
  subject: string
  content: string
  category: string
  status: string
  admin_response?: string
  created_at: string
  updated_at: string
  responded_at?: string
  category_name: string
  status_name: string
  response_provided: boolean
  user: {
    id: number
    username: string
    email: string
  }
}

export interface FeedbackListResponse {
  feedbacks: FeedbackResponse[]
  pagination: {
    current_page: number
    total_pages: number
    total_count: number
    per_page: number
  }
}

export const feedbackService = {
  // Get user's feedbacks
  async getFeedbacks(params?: {
    page?: number
    per_page?: number
    category?: string
    status?: string
  }): Promise<FeedbackListResponse> {
    const response = await apiClient.get('/feedbacks', { params })
    return response.data
  },

  // Get specific feedback
  async getFeedback(id: number): Promise<{ feedback: FeedbackResponse }> {
    const response = await apiClient.get(`/feedbacks/${id}`)
    return response.data
  },

  // Create new feedback
  async createFeedback(data: CreateFeedbackData): Promise<{
    message: string
    feedback: FeedbackResponse
  }> {
    const response = await apiClient.post('/feedbacks', { feedback: data })
    return response.data
  },

  // Update feedback
  async updateFeedback(id: number, data: UpdateFeedbackData): Promise<{
    message: string
    feedback: FeedbackResponse
  }> {
    const response = await apiClient.put(`/feedbacks/${id}`, { feedback: data })
    return response.data
  },

  // Get available categories
  async getCategories(): Promise<{ categories: FeedbackCategory[] }> {
    const response = await apiClient.get('/feedbacks/categories')
    return response.data
  }
}