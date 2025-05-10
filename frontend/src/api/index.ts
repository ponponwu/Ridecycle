// src/api/index.ts
import authService from './services/auth.service'
import bicycleService from './services/bicycle.service'
import orderService from './services/order.service'
import messageService from './services/message.service'

export { authService, bicycleService, orderService, messageService }

export const api = {
    auth: authService,
    bicycles: bicycleService,
    orders: orderService,
    messages: messageService,
}

export default api
