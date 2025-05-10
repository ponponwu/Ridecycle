import React, { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import HeroBanner from '@/components/home/HeroBanner'
import SearchSection from '@/components/home/SearchSection'
import FeaturedSection from '@/components/home/FeaturedSection'
import RecentlyAddedSection from '@/components/home/RecentlyAddedSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import TestimonialSection from '@/components/home/TestimonialSection'
import CallToAction from '@/components/home/CallToAction'
import { getBicyclesFormatted } from '@/services/bicycleService' // 新增
import { BicycleCardProps } from '@/components/bicycles/BicycleCard'

const Index = () => {
    const [featuredBicycles, setFeaturedBicycles] = useState<BicycleCardProps[]>([])
    const [recentBicycles, setRecentBicycles] = useState<BicycleCardProps[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchBicycles = async () => {
            try {
                const [featuredBikes, recentBikes] = await Promise.all([
                    getBicyclesFormatted({ featured: true, limit: 4 }),
                    getBicyclesFormatted({ sort: 'newest', limit: 4 }),
                ])
                // 轉換API回應為前端需要的格式
                setFeaturedBicycles(featuredBikes)
                setRecentBicycles(recentBikes)
            } catch (error) {
                console.error('Error fetching bicycles:', error)
                // 如果API失敗，使用假數據(保持舊邏輯不變)
            } finally {
                setIsLoading(false)
            }
        }
        fetchBicycles()
    }, [])

    return (
        <MainLayout>
            <HeroBanner />
            <SearchSection />
            <FeaturedSection bicycles={featuredBicycles} isLoading={isLoading} />
            <HowItWorksSection />
            <RecentlyAddedSection bicycles={recentBicycles} isLoading={isLoading} />
            <TestimonialSection />
            <CallToAction />
        </MainLayout>
    )
}

export default Index
