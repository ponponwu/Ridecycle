// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'

// 通知類型
export enum NotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
}

// 通知介面
export interface INotification {
    id: string
    type: NotificationType
    message: string
    title?: string
    duration?: number
}

// 通知上下文介面
interface NotificationContextType {
    notifications: INotification[]
    addNotification: (notification: Omit<INotification, 'id'>) => void
    removeNotification: (id: string) => void
    clearNotifications: () => void
}

// 創建通知上下文
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// 通知提供者 Props 介面
interface NotificationProviderProps {
    children: ReactNode
}

// 通知提供者組件
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<INotification[]>([])

    // 添加通知
    const addNotification = (notification: Omit<INotification, 'id'>) => {
        const id = Date.now().toString()
        const newNotification = { ...notification, id }

        setNotifications((prev) => [...prev, newNotification])

        // 如果設置了 duration，則在指定時間後自動移除通知
        if (notification.duration) {
            setTimeout(() => {
                removeNotification(id)
            }, notification.duration)
        }
    }

    // 移除通知
    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }

    // 清空所有通知
    const clearNotifications = () => {
        setNotifications([])
    }

    // 提供的上下文值
    const value = {
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
    }

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

// 使用通知上下文的 Hook
export const useNotification = () => {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotification 必須在 NotificationProvider 中使用')
    }
    return context
}

export default NotificationContext
