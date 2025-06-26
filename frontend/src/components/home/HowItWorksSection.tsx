import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Camera, Users, ShoppingCart, ArrowRight, CheckCircle } from 'lucide-react'

const HowItWorksSection = () => {
    const { t } = useTranslation()

    const steps = [
        {
            icon: Camera,
            title: t('listYourBike'),
            description: t('listYourBikeDescription'),
            color: 'from-emerald-500 to-emerald-600',
            bgColor: 'bg-emerald-50',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            step: '01',
        },
        {
            icon: Users,
            title: t('connectWithBuyers'),
            description: t('connectWithBuyersDescription'),
            color: 'from-teal-500 to-teal-600',
            bgColor: 'bg-teal-50',
            iconBg: 'bg-teal-100',
            iconColor: 'text-teal-600',
            step: '02',
        },
        {
            icon: ShoppingCart,
            title: t('completeTheSale'),
            description: t('completeTheSaleDescription'),
            color: 'from-amber-500 to-amber-600',
            bgColor: 'bg-amber-50',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            step: '03',
        },
    ]

    return (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
            {/* 背景裝飾 */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
                <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
            </div>

            <div className="container px-4 mx-auto relative z-10">
                {/* 標題區域 */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-4 py-2 text-sm font-medium mb-4">
                        <CheckCircle className="w-4 h-4" />
                        簡單三步驟
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('howItWorks')}</h2>
                    <p className="text-xl text-gray-600 leading-relaxed">{t('howItWorksSubtitle')}</p>
                    <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mt-6 rounded-full"></div>
                </div>

                {/* 步驟卡片 */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-16">
                    {steps.map((step, index) => {
                        const Icon = step.icon
                        return (
                            <div key={index} className="relative group">
                                {/* 連接線 */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent transform -translate-y-1/2 z-0">
                                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                                            <ArrowRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                )}

                                <div
                                    className={`relative ${step.bgColor} rounded-3xl p-8 h-full border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105`}
                                >
                                    {/* 步驟編號 */}
                                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                                        <span className="text-lg font-bold text-gray-900">{step.step}</span>
                                    </div>

                                    {/* 圖標區域 */}
                                    <div
                                        className={`w-20 h-20 ${step.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        <Icon className={`w-10 h-10 ${step.iconColor}`} />
                                    </div>

                                    {/* 內容 */}
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                                    <p className="text-gray-600 leading-relaxed text-lg">{step.description}</p>

                                    {/* 底部裝飾 */}
                                    <div
                                        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} rounded-b-3xl`}
                                    ></div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* 行動呼籲區域 */}
                <div className="text-center">
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">準備開始您的自行車之旅嗎？</h3>
                        <p className="text-gray-600 mb-6 text-lg">立即加入我們的社群，開始買賣您的第一輛自行車</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/upload">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                                >
                                    <Camera className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    {t('startSelling')}
                                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/search">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300"
                                >
                                    先瀏覽看看
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HowItWorksSection
