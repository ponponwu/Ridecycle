import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Loader2,
  Send,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react'
import AdminLayout from './AdminLayout'
import apiClient from '@/api/client'

interface AdminFeedbackResponse {
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
  can_be_resolved: boolean
  resolved_status: boolean
  user: {
    id: number
    username: string
    email: string
    created_at: string
    last_sign_in_at?: string
    phone?: string
    is_admin: boolean
    account_status: string
  }
}

interface FeedbackListResponse {
  feedbacks: AdminFeedbackResponse[]
  pagination: {
    current_page: number
    total_pages: number
    total_count: number
    per_page: number
  }
  stats: {
    total: number
    pending: number
    in_progress: number
    resolved: number
    closed: number
    unresolved: number
  }
}

interface FeedbackStats {
  total: number
  by_status: {
    pending: number
    in_progress: number
    resolved: number
    closed: number
  }
  by_category: Record<string, number>
  recent: {
    today: number
    this_week: number
    this_month: number
  }
  response_time: {
    avg_hours: number
  }
}

const FeedbackManagement: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<AdminFeedbackResponse[]>([])
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: 20
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    unresolved: false
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFeedback, setSelectedFeedback] = useState<AdminFeedbackResponse | null>(null)
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFeedbacks()
    loadStats()
  }, [currentPage, filters])

  const loadFeedbacks = async () => {
    try {
      setIsLoading(true)
      const params = {
        page: currentPage,
        per_page: 20,
        ...filters,
        unresolved: filters.unresolved ? 'true' : undefined
      }
      
      const response = await apiClient.get('/admin/feedbacks', { params })
      const data: FeedbackListResponse = response.data
      
      setFeedbacks(data.feedbacks)
      setPagination(data.pagination)
      setError(null)
    } catch (err: any) {
      console.error('Failed to load feedbacks:', err)
      setError('載入意見反饋失敗')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/admin/feedbacks/stats')
      setStats(response.data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const handleStatusChange = async (feedbackId: number, newStatus: string) => {
    try {
      await apiClient.put(`/admin/feedbacks/${feedbackId}`, {
        feedback: { status: newStatus }
      })
      loadFeedbacks()
      loadStats()
    } catch (err: any) {
      console.error('Failed to update status:', err)
      setError('更新狀態失敗')
    }
  }

  const handleResponse = async () => {
    if (!selectedFeedback || !responseText.trim()) return

    try {
      setIsSubmittingResponse(true)
      await apiClient.post(`/admin/feedbacks/${selectedFeedback.id}/respond`, {
        response: responseText
      })
      
      setIsResponseDialogOpen(false)
      setResponseText('')
      setSelectedFeedback(null)
      loadFeedbacks()
      loadStats()
    } catch (err: any) {
      console.error('Failed to submit response:', err)
      setError('回覆失敗')
    } finally {
      setIsSubmittingResponse(false)
    }
  }

  const handleDelete = async (feedbackId: number) => {
    if (!confirm('確定要刪除這個意見反饋嗎？此操作無法撤銷。')) {
      return
    }

    try {
      await apiClient.delete(`/admin/feedbacks/${feedbackId}`)
      loadFeedbacks()
      loadStats()
    } catch (err: any) {
      console.error('Failed to delete feedback:', err)
      setError('刪除失敗')
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'in_progress': return 'default'
      case 'resolved': return 'outline'
      case 'closed': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock
      case 'in_progress': return AlertCircle
      case 'resolved': return CheckCircle
      case 'closed': return XCircle
      default: return Clock
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">意見反饋管理</h1>
            <p className="text-gray-600 mt-1">管理用戶意見反饋和客服工單</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">總計</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">待處理</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.by_status.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">處理中</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.by_status.in_progress}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">平均回應時間</p>
                    <p className="text-2xl font-bold text-green-600">{stats.response_time.avg_hours.toFixed(1)}h</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>搜尋</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜尋主題或用戶..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div>
                <Label>狀態</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="全部狀態" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部狀態</SelectItem>
                    <SelectItem value="pending">待處理</SelectItem>
                    <SelectItem value="in_progress">處理中</SelectItem>
                    <SelectItem value="resolved">已解決</SelectItem>
                    <SelectItem value="closed">已關閉</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>分類</Label>
                <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="全部分類" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部分類</SelectItem>
                    <SelectItem value="bug_report">錯誤回報</SelectItem>
                    <SelectItem value="feature_request">功能建議</SelectItem>
                    <SelectItem value="general_inquiry">一般詢問</SelectItem>
                    <SelectItem value="account_issue">帳戶問題</SelectItem>
                    <SelectItem value="payment_issue">付款問題</SelectItem>
                    <SelectItem value="bicycle_listing">商品刊登</SelectItem>
                    <SelectItem value="safety_concern">安全顧慮</SelectItem>
                    <SelectItem value="other">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ ...filters, unresolved: !filters.unresolved })}
                  className={filters.unresolved ? 'bg-orange-50 border-orange-200' : ''}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {filters.unresolved ? '顯示未解決' : '顯示全部'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle>意見反饋列表</CardTitle>
            <CardDescription>
              共 {pagination.total_count} 個意見反饋
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">暫無意見反饋</h3>
                <p className="text-gray-600">沒有找到符合條件的意見反饋</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => {
                  const StatusIcon = getStatusIcon(feedback.status)
                  return (
                    <div key={feedback.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">{feedback.subject}</h3>
                            <Badge variant={getStatusBadgeVariant(feedback.status)} className="flex items-center gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {feedback.status_name}
                            </Badge>
                            <Badge variant="outline">{feedback.category_name}</Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {feedback.user.username} ({feedback.user.email})
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(feedback.created_at).toLocaleString('zh-TW')}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-4 line-clamp-2">{feedback.content}</p>
                          
                          {feedback.admin_response && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                              <p className="text-sm font-medium text-blue-900 mb-1">管理員回覆：</p>
                              <p className="text-blue-800">{feedback.admin_response}</p>
                              <p className="text-xs text-blue-600 mt-2">
                                回覆時間：{feedback.responded_at ? new Date(feedback.responded_at).toLocaleString('zh-TW') : ''}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedFeedback(feedback)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {!feedback.response_provided && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedFeedback(feedback)
                                setResponseText(feedback.admin_response || '')
                                setIsResponseDialogOpen(true)
                              }}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              回覆
                            </Button>
                          )}
                          
                          <Select 
                            value={feedback.status} 
                            onValueChange={(value) => handleStatusChange(feedback.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">待處理</SelectItem>
                              <SelectItem value="in_progress">處理中</SelectItem>
                              <SelectItem value="resolved">已解決</SelectItem>
                              <SelectItem value="closed">已關閉</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(feedback.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  上一頁
                </Button>
                <span className="text-sm text-gray-600">
                  第 {pagination.current_page} 頁，共 {pagination.total_pages} 頁
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage === pagination.total_pages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  下一頁
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Dialog */}
        <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>回覆意見反饋</DialogTitle>
              <DialogDescription>
                {selectedFeedback?.subject}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">用戶問題：</h4>
                <p className="text-gray-700">{selectedFeedback?.content}</p>
              </div>
              
              <div>
                <Label>回覆內容</Label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="請輸入您的回覆..."
                  className="min-h-32"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
                取消
              </Button>
              <Button 
                onClick={handleResponse}
                disabled={!responseText.trim() || isSubmittingResponse}
              >
                {isSubmittingResponse ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    送出中...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    送出回覆
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {selectedFeedback?.subject}
              </DialogTitle>
              <DialogDescription>
                意見反饋詳細資訊
              </DialogDescription>
            </DialogHeader>
            
            {selectedFeedback && (
              <div className="space-y-6">
                {/* Feedback Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">狀態</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getStatusBadgeVariant(selectedFeedback.status)}>
                        {selectedFeedback.status_name}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">分類</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{selectedFeedback.category_name}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">提交時間</Label>
                    <p className="text-sm mt-1">{new Date(selectedFeedback.created_at).toLocaleString('zh-TW')}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">最後更新</Label>
                    <p className="text-sm mt-1">{new Date(selectedFeedback.updated_at).toLocaleString('zh-TW')}</p>
                  </div>
                </div>
                
                {/* User Info */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">用戶資訊</Label>
                  <div className="bg-gray-50 p-4 rounded-lg mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm"><strong>用戶名：</strong> {selectedFeedback.user.username}</p>
                        <p className="text-sm"><strong>電子郵件：</strong> {selectedFeedback.user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm"><strong>註冊時間：</strong> {new Date(selectedFeedback.user.created_at).toLocaleDateString('zh-TW')}</p>
                        <p className="text-sm"><strong>帳戶狀態：</strong> {selectedFeedback.user.account_status}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Feedback Content */}
                <div>
                  <Label className="text-sm font-medium text-gray-600">詳細內容</Label>
                  <div className="bg-white border border-gray-200 p-4 rounded-lg mt-2">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedFeedback.content}</p>
                  </div>
                </div>
                
                {/* Admin Response */}
                {selectedFeedback.admin_response && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">管理員回覆</Label>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mt-2">
                      <p className="text-blue-900 whitespace-pre-wrap">{selectedFeedback.admin_response}</p>
                      {selectedFeedback.responded_at && (
                        <p className="text-xs text-blue-600 mt-2">
                          回覆時間：{new Date(selectedFeedback.responded_at).toLocaleString('zh-TW')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                關閉
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

export default FeedbackManagement