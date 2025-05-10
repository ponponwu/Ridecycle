// src/contexts/SearchContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { IBicycleListParams, BicycleType, BicycleCondition } from '@/types/bicycle.types'

// 搜尋上下文介面
interface SearchContextType {
    searchParams: IBicycleListParams
    updateSearchParams: (params: Partial<IBicycleListParams>) => void
    resetSearchParams: () => void
}

// 默認搜尋參數
const defaultSearchParams: IBicycleListParams = {
    page: 1,
    limit: 12,
    priceMin: 0,
    priceMax: 10000,
    sort: 'newest',
}

// 創建搜尋上下文
const SearchContext = createContext<SearchContextType | undefined>(undefined)

// 搜尋提供者 Props 介面
interface SearchProviderProps {
    children: ReactNode
}

// 搜尋提供者組件
export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
    const [searchParams, setSearchParams] = useState<IBicycleListParams>(defaultSearchParams)

    // 更新搜尋參數
    const updateSearchParams = (params: Partial<IBicycleListParams>) => {
        setSearchParams((prev) => ({ ...prev, ...params }))
    }

    // 重置搜尋參數
    const resetSearchParams = () => {
        setSearchParams(defaultSearchParams)
    }

    // 提供的上下文值
    const value = {
        searchParams,
        updateSearchParams,
        resetSearchParams,
    }

    return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

// 使用搜尋上下文的 Hook
export const useSearch = () => {
    const context = useContext(SearchContext)
    if (context === undefined) {
        throw new Error('useSearch 必須在 SearchProvider 中使用')
    }
    return context
}

export default SearchContext
