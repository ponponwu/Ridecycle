import React from 'react'
import BicycleGrid from '../bicycles/BicycleGrid'
import { BicycleCardProps } from '../bicycles/BicycleCard'
import { Skeleton } from '@/components/ui/skeleton'

interface RecentlyAddedSectionProps {
    bicycles: BicycleCardProps[]
    isLoading?: boolean
}

const RecentlyAddedSection = ({ bicycles, isLoading = false }: RecentlyAddedSectionProps) => {
    // 如果正在加載且沒有數據，顯示佔位骨架屏
    if (isLoading && bicycles.length === 0) {
        return (
            <div className="container px-4 mx-auto py-8 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">最新上架</h2>
                    <a href="/search?sort=newest" className="text-marketplace-blue hover:underline">
                        查看全部
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg overflow-hidden bicycle-card-shadow">
                            <div className="aspect-[4/3]">
                                <Skeleton className="h-full w-full" />
                            </div>
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // 如果沒有數據且不是加載狀態，顯示靜態假數據
    const displayBicycles =
        bicycles.length > 0
            ? bicycles
            : [
                  {
                      id: '5',
                      title: 'Santa Cruz Hightower C S 29" Mountain Bike',
                      price: 3200,
                      location: 'Austin, TX',
                      condition: 'Excellent',
                      brand: 'Santa Cruz',
                      imageUrl:
                          'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
                  },
                  // ...其他靜態數據，與原代碼相同
              ]

    return (
        <div className="container px-4 mx-auto py-8 bg-gray-50 rounded-xl">
            <BicycleGrid bicycles={displayBicycles} title="最新上架" viewAllLink="/search?sort=newest" />
        </div>
    )
}

export default RecentlyAddedSection
