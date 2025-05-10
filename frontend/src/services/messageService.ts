// src/services/messageService.ts
import api from './api'

export const getMessages = async () => {
    const response = await api.get('/messages')
    return response.data
}

export const getConversation = async (bicycleId: string) => {
    const response = await api.get(`/messages?bicycle_id=${bicycleId}`)
    return response.data
}

export const sendMessage = async (recipientId: string, bicycleId: string, content: string) => {
    const response = await api.post('/messages', {
        recipient_id: recipientId,
        bicycle_id: bicycleId,
        content,
    })
    return response.data
}
