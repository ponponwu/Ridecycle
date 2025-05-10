// src/services/bicycleService.ts
import api from './api'
import { BicycleCardProps } from '@/components/bicycles/BicycleCard'

// 轉換函數
export const formatBicycleData = (bicycles: any[]): BicycleCardProps[] => {
    return bicycles.map((bike) => ({
        id: bike.id,
        title: bike.title,
        price: bike.price,
        location: bike.location,
        condition: bike.condition,
        brand: bike.brand,
        imageUrl:
            bike.bicycle_images && bike.bicycle_images.length > 0
                ? bike.bicycle_images[0].image_url
                : 'https://images.unsplash.com/photo-placeholder.jpg',
        isFavorite: bike.is_favorited || false,
    }))
}

// 獲取自行車列表，直接返回格式化後的數據
export const getBicyclesFormatted = async (params = {}): Promise<BicycleCardProps[]> => {
    try {
        const response = await api.get('/bicycles', { params })
        return formatBicycleData(response.data)
    } catch (error) {
        console.error('Error fetching bicycles:', error)
        return []
    }
}

// 獲取自行車列表
export const getBicycles = async (params = {}) => {
    try {
        const response = await api.get('/bicycles', { params })
        return response.data
    } catch (error) {
        console.error('Error fetching bicycles:', error)
        // 如果API失敗，返回空數組
        return []
    }
}

// 獲取單個自行車詳情
export const getBicycleById = async (id: string) => {
    try {
        const response = await api.get(`/bicycles/${id}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching bicycle with id ${id}:`, error)
        throw error
    }
}

// 創建新自行車
export const createBicycle = async (formData: FormData) => {
    const response = await api.post('/bicycles', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return response.data
}

// 更新自行車
export const updateBicycle = async (id: string, formData: FormData) => {
    const response = await api.put(`/bicycles/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return response.data
}

// 刪除自行車
export const deleteBicycle = async (id: string) => {
    const response = await api.delete(`/bicycles/${id}`)
    return response.data
}

// 搜索自行車
export const searchBicycles = async (query: string, filters = {}) => {
    const response = await api.get('/bicycles/search', {
        params: {
            q: query,
            ...filters,
        },
    })
    return response.data
}
