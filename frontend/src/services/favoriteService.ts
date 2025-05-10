// src/services/favoriteService.ts
import api from './api'

export const getFavorites = async () => {
    const response = await api.get('/favorites')
    return response.data
}

export const addToFavorites = async (bicycleId: string) => {
    const response = await api.post('/favorites', { bicycle_id: bicycleId })
    return response.data
}

export const removeFromFavorites = async (bicycleId: string) => {
    const response = await api.delete(`/favorites/${bicycleId}`)
    return response.data
}
