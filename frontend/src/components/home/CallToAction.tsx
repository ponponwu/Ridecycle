import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Search, Upload, ArrowRight, Sparkles, Users } from 'lucide-react'

const CallToAction = () => {
    const { t } = useTranslation()

    return (
        <section className="relative py-24 bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 overflow-hidden">
            {/* 動態背景裝飾 */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-teal-400 rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-400 rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400 rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-500"></div>
                </div>

                {/* 幾何圖案 */}
                <div className="absolute inset-0 opacity-10">
                    <svg
                        className="absolute top-10 right-10 w-24 h-24 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <svg
                        className="absolute bottom-20 left-20 w-16 h-16 text-white animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                        />
                    </svg>
                </div>
            </div>

            <div className="container px-4 mx-auto relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    {/* 徽章 */}
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white mb-8">
                        <Sparkles className="w-5 h-5 text-teal-300" />
                        <span className="font-medium">加入我們的社群</span>
                    </div>

                    {/* 主標題 */}
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        {t('readyToFindBike')}
                    </h2>

                    {/* 副標題 */}
                    <p className="text-xl md:text-2xl text-emerald-100 mb-8 leading-relaxed max-w-3xl mx-auto">
                        {t('joinCommunity')}
                    </p>

                    {/* 統計數據 */}
                    <div className="flex flex-wrap justify-center gap-8 mb-12">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">1000+</div>
                            <div className="text-emerald-200 flex items-center gap-1 justify-center">
                                <Users className="w-4 h-4" />
                                活躍會員
                            </div>
                        </div>
                        <div className="hidden sm:block w-px h-16 bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">500+</div>
                            <div className="text-emerald-200 flex items-center gap-1 justify-center">
                                <Search className="w-4 h-4" />
                                成功交易
                            </div>
                        </div>
                        <div className="hidden sm:block w-px h-16 bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">24/7</div>
                            <div className="text-emerald-200 flex items-center gap-1 justify-center">
                                <Sparkles className="w-4 h-4" />
                                全天候服務
                            </div>
                        </div>
                    </div>

                    {/* 行動按鈕 */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
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

                        <div className="text-white text-lg font-medium">或</div>

                        <Link to="/upload">
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-3 border-white text-white hover:bg-white hover:text-emerald-700 px-10 py-5 text-xl font-bold rounded-2xl backdrop-blur-sm transition-all duration-300 transform hover:scale-105 group min-w-[200px]"
                            >
                                <Upload className="mr-3 h-6 w-6 group-hover:-translate-y-1 transition-transform" />
                                {t('sellYourBike')}
                            </Button>
                        </Link>
                    </div>

                    {/* 信任指標 */}
                    <div className="mt-16 pt-8 border-t border-white/20">
                        <div className="flex flex-wrap justify-center items-center gap-8 text-emerald-200">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span>安全交易保障</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span>專業客服支援</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span>品質認證</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CallToAction
