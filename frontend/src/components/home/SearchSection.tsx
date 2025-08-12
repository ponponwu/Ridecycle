import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, MapPin, DollarSign, Bike, Filter, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const SearchSection = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [filters, setFilters] = useState({
        priceRange: '',
        type: '',
        brand: '',
        location: '',
    })

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const params = new URLSearchParams()
        if (searchInput) params.append('q', searchInput)
        if (filters.priceRange) params.append('price', filters.priceRange)
        if (filters.type) params.append('type', filters.type)
        if (filters.brand) params.append('brand', filters.brand)
        if (filters.location) params.append('location', filters.location)

        navigate(`/search?${params.toString()}`)
    }

    return (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
            {/* 背景裝飾 */}
            <div className="absolute inset-0">
                <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-60"></div>
            </div>

            <div className="container px-4 mx-auto relative z-10">
                {/* 標題區域 */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-4 py-2 text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        智慧搜尋
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('findPerfectBike')}</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('advancedSearchOptions')}</p>
                </div>

                {/* 主搜尋區域 */}
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* 主搜尋框 */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="搜尋自行車型號、品牌..."
                                        className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-gray-800 placeholder-gray-500 text-lg transition-all duration-200"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="h-14 px-8 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group whitespace-nowrap"
                                >
                                    <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                    立即搜尋
                                </Button>
                            </div>

                            {/* 篩選器 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">💰 價格範圍</label>
                                    <select
                                        name="priceRange"
                                        value={filters.priceRange}
                                        onChange={handleFilterChange}
                                        className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-gray-700 transition-all duration-200"
                                    >
                                        <option value="">{t('anyPrice')}</option>
                                        <option value="0-10000">NT$ 10,000 以下</option>
                                        <option value="10000-30000">NT$ 10,000 - 30,000</option>
                                        <option value="30000-50000">NT$ 30,000 - 50,000</option>
                                        <option value="50000-100000">NT$ 50,000 - 100,000</option>
                                        <option value="100000-200000">NT$ 100,000 - 200,000</option>
                                        <option value="200000-300000">NT$ 200,000 - 300,000</option>
                                        <option value="300000+">NT$ 300,000 以上</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">🚴 車輛類型</label>
                                    <select
                                        name="type"
                                        value={filters.type}
                                        onChange={handleFilterChange}
                                        className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-gray-700 transition-all duration-200"
                                    >
                                        <option value="">{t('allTypes')}</option>
                                        <option value="road">公路車</option>
                                        <option value="mountain">登山車</option>
                                        <option value="gravel">Gravel</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">🏷️ 品牌</label>
                                    <select
                                        name="brand"
                                        value={filters.brand}
                                        onChange={handleFilterChange}
                                        className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-gray-700 transition-all duration-200"
                                    >
                                        <option value="">{t('allBrands')}</option>
                                        <option value="giant">Giant</option>
                                        <option value="merida">Merida</option>
                                        <option value="specialized">Specialized</option>
                                        <option value="trek">Trek</option>
                                        <option value="cannondale">Cannondale</option>
                                        <option value="scott">Scott</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">📍 地點</label>
                                    <select
                                        name="location"
                                        value={filters.location}
                                        onChange={handleFilterChange}
                                        className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-gray-700 transition-all duration-200"
                                    >
                                        <option value="">{t('allLocations')}</option>
                                        <option value="taipei">台北市</option>
                                        <option value="newTaipei">新北市</option>
                                        <option value="taoyuan">桃園市</option>
                                        <option value="taichung">台中市</option>
                                        <option value="tainan">台南市</option>
                                        <option value="kaohsiung">高雄市</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* 快速搜尋標籤 */}
                <div className="max-w-5xl mx-auto mt-8">
                    <div className="text-center mb-6">
                        <p className="text-gray-600 mb-1 font-medium">🔥 熱門搜尋</p>
                        <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto"></div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        {[
                            { label: '🚴‍♀️ 公路車', type: 'road' },
                            { label: '🏔️ 登山車', type: 'mountain' },
                            { label: '🔥 Giant', brand: 'giant' },
                            { label: '⭐ Merida', brand: 'merida' },
                            { label: '💰 NT$ 10,000以下', priceRange: '0-10000' },
                            { label: '📍 台北市', location: 'taipei' },
                        ].map((tag, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    const params = new URLSearchParams()
                                    if (tag.type) params.append('type', tag.type)
                                    if (tag.brand) params.append('brand', tag.brand)
                                    if (tag.priceRange) params.append('price', tag.priceRange)
                                    if (tag.location) params.append('location', tag.location)
                                    navigate(`/search?${params.toString()}`)
                                }}
                                className="px-5 py-3 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-full text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200 hover:border-emerald-300 transform hover:scale-105"
                            >
                                {tag.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SearchSection
