// src/contexts/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { IBicycleCartItem } from '@/types/bicycle.types'

// 購物車上下文介面
interface CartContextType {
    items: IBicycleCartItem[]
    totalItems: number
    totalPrice: number
    addItem: (item: IBicycleCartItem) => void
    removeItem: (bicycleId: string) => void
    clearCart: () => void
}

// 創建購物車上下文
const CartContext = createContext<CartContextType | undefined>(undefined)

// 購物車提供者 Props 介面
interface CartProviderProps {
    children: ReactNode
}

// 購物車提供者組件
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [items, setItems] = useState<IBicycleCartItem[]>([])

    // 從本地存儲加載購物車
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (error) {
                console.error('購物車數據無效:', error)
                localStorage.removeItem('cart')
            }
        }
    }, [])

    // 保存購物車到本地存儲
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items))
    }, [items])

    // 計算總數量
    const totalItems = items.length

    // 計算總價格
    const totalPrice = items.reduce((total, item) => total + item.price, 0)

    // 添加項目到購物車
    const addItem = (item: IBicycleCartItem) => {
        // 檢查是否已在購物車中
        const exists = items.some((i) => i.bicycleId === item.bicycleId)
        if (!exists) {
            setItems([...items, item])
        }
    }

    // 從購物車移除項目
    const removeItem = (bicycleId: string) => {
        setItems(items.filter((item) => item.bicycleId !== bicycleId))
    }

    // 清空購物車
    const clearCart = () => {
        setItems([])
    }

    // 提供的上下文值
    const value = {
        items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        clearCart,
    }

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// 使用購物車上下文的 Hook
export const useCart = () => {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart 必須在 CartProvider 中使用')
    }
    return context
}

export default CartContext
