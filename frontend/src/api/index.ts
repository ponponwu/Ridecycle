// src/api/index.ts
import authService from './services/auth.service'
import bicycleService from './services/bicycle.service'
import orderService from './services/order.service'
import messageService from './services/message.service'
import favoriteService from './services/favorite.service'
import offerService from './services/offer.service'

/**
 * 導出所有 API 服務
 */
export { authService, bicycleService, orderService, messageService, favoriteService, offerService }

/**
 * 統一的 API 對象
 */
export const api = {
    auth: authService,
    bicycles: bicycleService,
    orders: orderService,
    messages: messageService,
    favorites: favoriteService,
    offers: offerService,
}

export default api
