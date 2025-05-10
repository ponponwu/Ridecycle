// src/services/offerService.ts
import api from './api'

export const getOffers = async (bicycleId: string) => {
    const response = await api.get(`/bicycles/${bicycleId}/offers`)
    return response.data
}

export const makeOffer = async (bicycleId: string, amount: number) => {
    const response = await api.post(`/bicycles/${bicycleId}/offers`, { amount })
    return response.data
}
