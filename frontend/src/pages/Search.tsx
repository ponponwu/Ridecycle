import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Search, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import SearchResults from '@/components/search/SearchResults'

const SearchPage = () => {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
    const [filters, setFilters] = useState({
        priceRange: searchParams.get('price') || '',
        type: searchParams.get('type') || '',
        brand: searchParams.get('brand') || '',
        location: searchParams.get('location') || '',
    })

    // Update search parameters when filters change
    useEffect(() => {
        const params = new URLSearchParams()
        if (searchQuery) params.set('q', searchQuery)
        if (filters.priceRange) params.set('price', filters.priceRange)
        if (filters.type) params.set('type', filters.type)
        if (filters.brand) params.set('brand', filters.brand)
        if (filters.location) params.set('location', filters.location)

        setSearchParams(params)
    }, [searchQuery, filters, setSearchParams])

    // Update local state when URL search parameters change
    useEffect(() => {
        setSearchQuery(searchParams.get('q') || '')
        setFilters({
            priceRange: searchParams.get('price') || '',
            type: searchParams.get('type') || '',
            brand: searchParams.get('brand') || '',
            location: searchParams.get('location') || '',
        })
    }, [searchParams])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        // URL params are already updated by the effect above
    }

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setFilters((prev) => ({ ...prev, [name]: value }))
    }

    return (
        <MainLayout>
            <div className="py-10 bg-gray-50">
                <div className="container px-4 mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">{t('search')}</h1>
                    </div>

                    <div className="max-w-3xl mx-auto mb-10">
                        <form onSubmit={handleSearch}>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-grow">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('searchPlaceholder')}
                                        className="w-full h-14 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
                                    />
                                </div>
                                <Button type="submit" className="h-14 bg-marketplace-blue hover:bg-blue-600 px-8">
                                    <Search className="mr-2 h-5 w-5" />
                                    {t('search')}
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('priceRange')}
                                    </label>
                                    <select
                                        name="priceRange"
                                        value={filters.priceRange}
                                        onChange={handleFilterChange}
                                        className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
                                    >
                                        <option value="">{t('anyPrice')}</option>
                                        <option value="0-10000">{t('priceRangeOptions.under10k')}</option>
                                        <option value="10000-30000">{t('priceRangeOptions.10k-30k')}</option>
                                        <option value="30000-50000">{t('priceRangeOptions.30k-50k')}</option>
                                        <option value="50000-100000">{t('priceRangeOptions.50k-100k')}</option>
                                        <option value="100000-200000">{t('priceRangeOptions.100k-200k')}</option>
                                        <option value="200000-300000">{t('priceRangeOptions.200k-300k')}</option>
                                        <option value="300000+">{t('priceRangeOptions.over300k')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('bicycleType')}
                                    </label>
                                    <select
                                        name="type"
                                        value={filters.type}
                                        onChange={handleFilterChange}
                                        className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
                                    >
                                        <option value="">{t('allTypes')}</option>
                                        <option value="road">{t('bicycleTypeOptions.roadBike')}</option>
                                        <option value="mountain">{t('bicycleTypeOptions.mountainBike')}</option>
                                        <option value="hybrid">{t('bicycleTypeOptions.hybridBike')}</option>
                                        <option value="gravel">{t('bicycleTypeOptions.gravelbike')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('brand')}</label>
                                    <select
                                        name="brand"
                                        value={filters.brand}
                                        onChange={handleFilterChange}
                                        className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
                                    >
                                        <option value="">{t('allBrands')}</option>
                                        <option value="giant">{t('brandOptions.giant')}</option>
                                        <option value="merida">{t('brandOptions.merida')}</option>
                                        <option value="specialized">{t('brandOptions.specialized')}</option>
                                        <option value="trek">{t('brandOptions.trek')}</option>
                                        <option value="cannondale">{t('brandOptions.cannondale')}</option>
                                        <option value="scott">{t('brandOptions.scott')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('location')}
                                    </label>
                                    <select
                                        name="location"
                                        value={filters.location}
                                        onChange={handleFilterChange}
                                        className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-marketplace-blue focus:border-transparent"
                                    >
                                        <option value="">{t('allLocations')}</option>
                                        <option value="taipei">{t('locationOptions.taipei')}</option>
                                        <option value="newTaipei">{t('locationOptions.newTaipei')}</option>
                                        <option value="taoyuan">{t('locationOptions.taoyuan')}</option>
                                        <option value="taichung">{t('locationOptions.taichung')}</option>
                                        <option value="tainan">{t('locationOptions.tainan')}</option>
                                        <option value="kaohsiung">{t('locationOptions.kaohsiung')}</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <SearchResults />
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default SearchPage
