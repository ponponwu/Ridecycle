import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, MessageSquare, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { feedbackService, CreateFeedbackData, FeedbackCategory } from '@/api/feedbackService'
import { useTranslation } from 'react-i18next'

interface FeedbackFormProps {
  onSubmitSuccess?: () => void
  className?: string
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmitSuccess, className }) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<CreateFeedbackData>({
    subject: '',
    content: '',
    category: ''
  })
  const [categories, setCategories] = useState<FeedbackCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const response = await feedbackService.getCategories()
      setCategories(response.categories)
    } catch (err) {
      console.error('Failed to load categories:', err)
      setError('無法載入分類選項，請稍後再試')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.subject.trim()) {
      newErrors.subject = '請輸入主題'
    } else if (formData.subject.length > 200) {
      newErrors.subject = '主題長度不能超過200個字元'
    }

    if (!formData.content.trim()) {
      newErrors.content = '請輸入詳細內容'
    } else if (formData.content.length > 2000) {
      newErrors.content = '內容長度不能超過2000個字元'
    }

    if (!formData.category) {
      newErrors.category = '請選擇回饋分類'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await feedbackService.createFeedback(formData)
      setSuccess(response.message || '意見反饋已成功提交！我們會盡快回覆您。')
      setFormData({ subject: '', content: '', category: '' })
      setErrors({})
      
      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    } catch (err: any) {
      console.error('Failed to submit feedback:', err)
      if (err.response?.data?.errors) {
        setError(`提交失敗：${err.response.data.errors.join(', ')}`)
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('提交失敗，請稍後再試')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateFeedbackData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          意見反饋
        </CardTitle>
        <CardDescription>
          我們重視您的意見。請填寫以下表單，我們會盡快回覆您的問題或建議。
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">回饋分類 *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange('category', value)}
              disabled={isLoadingCategories}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue 
                  placeholder={isLoadingCategories ? "載入中..." : "請選擇分類"} 
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.key} value={category.key}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">主題 *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="請簡短描述您的問題或建議"
              className={errors.subject ? 'border-red-500' : ''}
              maxLength={200}
            />
            <div className="flex justify-between text-sm text-gray-500">
              {errors.subject && (
                <span className="text-red-500">{errors.subject}</span>
              )}
              <span className={`ml-auto ${formData.subject.length > 180 ? 'text-orange-500' : ''}`}>
                {formData.subject.length}/200
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">詳細內容 *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="請詳細描述您遇到的問題、建議或意見。提供越多細節，我們越能提供準確的幫助。"
              className={`min-h-32 ${errors.content ? 'border-red-500' : ''}`}
              maxLength={2000}
            />
            <div className="flex justify-between text-sm text-gray-500">
              {errors.content && (
                <span className="text-red-500">{errors.content}</span>
              )}
              <span className={`ml-auto ${formData.content.length > 1800 ? 'text-orange-500' : ''}`}>
                {formData.content.length}/2000
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isLoadingCategories}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                提交意見反饋
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-sm text-gray-500 space-y-2">
          <p>📝 <strong>溫馨提示：</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>我們通常在24-48小時內回覆</li>
            <li>如果是緊急問題，請直接聯繫客服</li>
            <li>提供螢幕截圖或詳細步驟有助於我們快速解決問題</li>
            <li>您可以在個人檔案中查看回饋歷史和回覆狀態</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default FeedbackForm