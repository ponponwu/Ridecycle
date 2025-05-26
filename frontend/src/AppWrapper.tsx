import React from 'react'
import App from './App'

// 檢查是否為生產環境
const isProduction = import.meta.env.PROD

// 根據環境決定是否使用 StrictMode
const AppWrapper = () => {
    return isProduction ? (
        <App />
    ) : (
        <React.StrictMode>
            <App />
        </React.StrictMode>
    )
}

export default AppWrapper
