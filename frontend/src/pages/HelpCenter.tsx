import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'
import FeedbackForm from '@/components/feedback/FeedbackForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  Search, 
  HelpCircle, 
  Shield, 
  CreditCard, 
  Bike, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const HelpCenter: React.FC = () => {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  const faqCategories = [
    {
      id: 'getting-started',
      title: '新手入門',
      icon: HelpCircle,
      count: 12,
      items: [
        { question: '如何註冊帳戶？', answer: '點擊右上角的「註冊」按鈕，填寫必要資訊即可完成註冊。' },
        { question: '如何刊登自行車？', answer: '登入後點選「賣自行車」，上傳照片並填寫詳細資訊。' },
        { question: '如何購買自行車？', answer: '瀏覽商品後點擊「聯繫賣家」，與賣家進行議價和交易安排。' },
        { question: '平台收費標準是什麼？', answer: '買家免費使用，賣家僅在成功交易後收取少量手續費。' }
      ]
    },
    {
      id: 'safety',
      title: '安全交易',
      icon: Shield,
      count: 8,
      items: [
        { question: '如何確保交易安全？', answer: '建議當面交易、現場驗車，並使用平台內建的對話功能溝通。' },
        { question: '遇到詐騙怎麼辦？', answer: '立即舉報該用戶，並聯繫客服處理。我們會調查並採取必要措施。' },
        { question: '如何驗證賣家身份？', answer: '查看賣家評價、註冊時間和交易歷史，選擇信譽良好的賣家。' },
        { question: '交易地點建議？', answer: '建議在公共場所、有監視器的地點進行交易，確保雙方安全。' }
      ]
    },
    {
      id: 'payment',
      title: '付款相關',
      icon: CreditCard,
      count: 6,
      items: [
        { question: '支援哪些付款方式？', answer: '支援現金交易、銀行轉帳和第三方支付平台。' },
        { question: '如何申請退款？', answer: '在交易糾紛情況下，請聯繫客服協助處理退款事宜。' },
        { question: '手續費何時收取？', answer: '僅在交易成功完成後收取賣家手續費，買家無需支付任何費用。' }
      ]
    },
    {
      id: 'bicycle',
      title: '自行車相關',
      icon: Bike,
      count: 10,
      items: [
        { question: '如何評估自行車價值？', answer: '參考同型號市場價格、車況、年份和配件等因素來定價。' },
        { question: '如何拍攝吸引人的照片？', answer: '在光線充足的地方拍攝，展示車輛各個角度和細節。' },
        { question: '可以刊登哪些類型的自行車？', answer: '支援各種類型：公路車、山地車、城市車、電動車等。' },
        { question: '如何寫出好的商品描述？', answer: '詳細描述車況、使用歷史、配件清單和任何瑕疵。' }
      ]
    }
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: '電子郵件',
      description: 'support@ridecycle.com',
      detail: '24小時內回覆',
      action: 'mailto:support@ridecycle.com'
    },
    {
      icon: Phone,
      title: '客服專線',
      description: '0800-123-456',
      detail: '週一至週五 9:00-18:00',
      action: 'tel:0800123456'
    },
    {
      icon: MessageSquare,
      title: '線上客服',
      description: '即時聊天支援',
      detail: '週一至週日 9:00-21:00',
      action: '#'
    }
  ]

  const handleFeedbackSuccess = () => {
    setShowFeedbackForm(false)
  }

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              幫助中心
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-emerald-100">
              找到您需要的答案，或與我們聯繫獲得協助
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="搜尋常見問題..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg bg-white text-gray-900 border-0 shadow-lg"
              />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <Tabs defaultValue="faq" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 mb-8">
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                常見問題
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                意見反饋
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                聯繫我們
              </TabsTrigger>
            </TabsList>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-8">
              {/* FAQ Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {faqCategories.map((category) => {
                  const Icon = category.icon
                  return (
                    <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <Icon className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">{category.title}</h3>
                        <Badge variant="secondary">{category.count} 個問題</Badge>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* FAQ Items */}
              <div className="space-y-6">
                {filteredFAQs.map((category) => (
                  <div key={category.id}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <category.icon className="h-6 w-6 text-emerald-600" />
                      {category.title}
                    </h2>
                    <div className="grid gap-4">
                      {category.items.map((item, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-2 text-gray-900">
                              {item.question}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {item.answer}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {searchQuery && filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">找不到相關問題</h3>
                  <p className="text-gray-600 mb-6">試試其他關鍵字，或直接提交意見反饋</p>
                  <Button onClick={() => setShowFeedbackForm(true)}>
                    提交問題
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback">
              <div className="max-w-4xl mx-auto">
                {!isAuthenticated ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-4">需要登入才能提交意見反饋</h3>
                      <p className="text-gray-600 mb-6">
                        為了更好地為您服務，請先登入您的帳戶
                      </p>
                      <div className="space-x-4">
                        <Link to="/login">
                          <Button>登入</Button>
                        </Link>
                        <Link to="/register">
                          <Button variant="outline">註冊</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <FeedbackForm onSubmitSuccess={handleFeedbackSuccess} />
                )}
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">聯繫我們</h2>
                  <p className="text-xl text-gray-600">
                    我們隨時為您提供協助
                  </p>
                </div>

                {/* Contact Methods */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {contactMethods.map((method, index) => (
                    <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                      <CardContent className="p-8">
                        <method.icon className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
                        <p className="text-emerald-600 font-medium mb-2">{method.description}</p>
                        <p className="text-sm text-gray-600 mb-4">{method.detail}</p>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.open(method.action, '_blank')}
                        >
                          立即聯繫
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Office Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      辦公地址
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">台北總部</h3>
                        <p className="text-gray-600 mb-4">
                          台北市信義區信義路五段7號<br />
                          台北101大樓35樓
                        </p>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            營業時間：週一至週五 9:00-18:00
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            電話：(02) 1234-5678
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">客服中心</h3>
                        <p className="text-gray-600 mb-4">
                          24小時線上客服<br />
                          即時回應您的問題
                        </p>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            平均回應時間：2分鐘內
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            問題解決率：98%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}

export default HelpCenter