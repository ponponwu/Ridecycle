// src/components/NotificationContainer.tsx
import React from 'react'
import { useNotification, NotificationType } from '@/contexts/NotificationContext'

// 通知容器樣式
const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxWidth: '400px',
}

// 根據通知類型獲取樣式
const getNotificationStyle = (type: NotificationType): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
        padding: '1rem',
        borderRadius: '0.375rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }

    switch (type) {
        case NotificationType.SUCCESS:
            return {
                ...baseStyle,
                backgroundColor: '#DEF7EC',
                borderLeft: '4px solid #0E9F6E',
                color: '#03543E',
            }
        case NotificationType.ERROR:
            return {
                ...baseStyle,
                backgroundColor: '#FDE8E8',
                borderLeft: '4px solid #F05252',
                color: '#9B1C1C',
            }
        case NotificationType.WARNING:
            return {
                ...baseStyle,
                backgroundColor: '#FEF3C7',
                borderLeft: '4px solid #F59E0B',
                color: '#92400E',
            }
        case NotificationType.INFO:
        default:
            return {
                ...baseStyle,
                backgroundColor: '#E1EFFE',
                borderLeft: '4px solid #3F83F8',
                color: '#1E429F',
            }
    }
}

// 通知容器組件
const NotificationContainer: React.FC = () => {
    const { notifications, removeNotification } = useNotification()

    if (notifications.length === 0) {
        return null
    }

    return (
        <div style={containerStyle}>
            {notifications.map((notification) => (
                <div key={notification.id} style={getNotificationStyle(notification.type)} role="alert">
                    <div>
                        {notification.title && <p style={{ fontWeight: 'bold' }}>{notification.title}</p>}
                        <p>{notification.message}</p>
                    </div>
                    <button
                        onClick={() => removeNotification(notification.id)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            marginLeft: '0.5rem',
                        }}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>
            ))}
        </div>
    )
}

export default NotificationContainer
