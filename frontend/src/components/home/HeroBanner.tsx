import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Search, Upload, ArrowRight, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const HeroBanner = () => {
    const { t } = useTranslation()

    const bikeCategories = [
        { name: t('bikeCategories.mountainBikes'), type: 'mountainbike', icon: '🚵‍♂️' },
        { name: t('bikeCategories.roadBikes'), type: 'roadbike', icon: '🚴‍♀️' },
        { name: t('bikeCategories.hybridBikes'), type: 'hybridbike', icon: '🚲' },
        { name: t('bikeCategories.cityBikes'), type: 'citybike', icon: '🏙️' },
        { name: t('bikeCategories.electricBikes'), type: 'electricbike', icon: '⚡' },
        { name: t('bikeCategories.kidsBikes'), type: 'kidsbike', icon: '👶' },
        { name: t('bikeCategories.bmx'), type: 'bmx', icon: '🤸‍♂️' },
    ]

    const backgroundPattern =
        "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20s-20-8.954-20-20 8.954-20 20-20 20 8.954 20 20Z'/%3E%3C/g%3E%3C/svg%3E"

    return (
        <section className="relative min-h-[80vh] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 overflow-hidden">
            {/* 裝飾性背景元素 */}
            <div className="absolute inset-0">
                <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ backgroundImage: `url("${backgroundPattern}")` }}
                ></div>
                <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                <div className="absolute bottom-40 left-10 w-24 h-24 bg-teal-300/10 rounded-full blur-lg"></div>
                <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-emerald-400/10 rounded-full blur-md"></div>
            </div>

            <div className="container relative px-4 py-16 mx-auto sm:py-20 md:py-24 lg:py-28">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                    <div className="flex flex-col justify-center space-y-8">
                        {/* 徽章 */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white w-fit">
                            <Star className="w-4 h-4 text-teal-300 fill-current" />
                            <span className="text-sm font-medium">台灣第一自行車交易平台</span>
                        </div>

                        {/* 主標題 */}
                        <div className="space-y-4">
                            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl leading-tight">
                                {t('findPerfectBike')}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                                    {t('ride')}
                                </span>
                                <div className="w-12 h-1 bg-gradient-to-r from-teal-300 to-emerald-400 rounded-full"></div>
                            </div>
                        </div>

                        {/* 描述 */}
                        <p className="text-xl text-emerald-100 leading-relaxed max-w-xl">
                            {t('heroBannerDescription')}
                        </p>

                        {/* 行動按鈕 */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/search">
                                <Button
                                    size="lg"
                                    className="bg-white text-emerald-700 hover:bg-gray-50 px-10 py-5 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group min-w-[200px]"
                                >
                                    <Search className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                                    {t('browseBikes')}
                                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/upload">
                                <Button
                                    size="lg"
                                    className="bg-white text-emerald-700 hover:bg-gray-50 px-10 py-5 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group min-w-[200px]"
                                >
                                    <Upload className="mr-3 h-6 w-6 group-hover:-translate-y-1 transition-transform" />
                                    {t('sellYourBike')}
                                </Button>
                            </Link>
                        </div>

                        {/* 統計數據 */}
                        <div className="flex items-center gap-8 pt-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">1000+</div>
                                <div className="text-sm text-emerald-200">活躍會員</div>
                            </div>
                            <div className="w-px h-12 bg-white/20"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">500+</div>
                                <div className="text-sm text-emerald-200">成功交易</div>
                            </div>
                            <div className="w-px h-12 bg-white/20"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">4.8★</div>
                                <div className="text-sm text-emerald-200">用戶評分</div>
                            </div>
                        </div>
                    </div>

                    {/* 右側視覺區域 */}
                    <div className="relative hidden lg:block">
                        <div className="relative">
                            {/* 背景漸層 */}
                            <div className="w-full h-[600px] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl shadow-2xl relative overflow-hidden">
                                {/* 裝飾圖案 */}
                                <div className="absolute inset-0">
                                    <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full"></div>
                                    <div className="absolute top-20 right-20 w-20 h-20 bg-teal-300/30 rounded-full"></div>
                                    <div className="absolute bottom-20 left-20 w-24 h-24 bg-emerald-300/30 rounded-full"></div>
                                    <div className="absolute bottom-10 right-10 w-28 h-28 bg-white/15 rounded-full"></div>
                                </div>

                                {/* 自行車圖標 */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-white/80 text-9xl">🚴‍♀️</div>
                                </div>

                                {/* 裝飾文字 */}
                                <div className="absolute bottom-16 left-8 text-white">
                                    <div className="text-3xl font-bold mb-2">騎行台灣</div>
                                    <div className="text-lg opacity-80">探索無限可能</div>
                                </div>
                            </div>

                            {/* 浮動卡片 */}
                            <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl z-30 transform rotate-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">✓</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">安全交易</div>
                                        <div className="text-sm text-gray-600">平台保障</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-8 right-8 bg-emerald-600 text-white rounded-2xl p-4 shadow-xl z-30 transform -rotate-2">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">NT$ 15,000</div>
                                    <div className="text-sm opacity-90">平均售價</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 分類標籤 */}
            {/* <div className="container px-4 pb-8 mx-auto relative z-20">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="flex flex-wrap justify-center gap-3">
                        {bikeCategories.map((category) => (
                            <Link
                                key={category.type}
                                to={`/search?type=${encodeURIComponent(category.type)}`}
                                className="group"
                            >
                                <Button
                                    variant="ghost"
                                    className="bg-white/20 hover:bg-white hover:text-emerald-700 text-white rounded-full px-4 py-2 transition-all duration-300 group-hover:scale-105 border border-white/30"
                                >
                                    <span className="mr-2">{category.icon}</span>
                                    {category.name}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div> */}
        </section>
    )
}

export default HeroBanner
