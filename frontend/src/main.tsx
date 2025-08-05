import React from 'react'
import ReactDOM from 'react-dom/client'
import AppWrapper from './AppWrapper'
import './index.css'
import './i18n'
import { initializeSecurity } from './utils/security'
import { forceUpdateCSP } from './utils/dynamicCSP'

// 初始化安全設定
initializeSecurity()

// 強制重新生成和更新 CSP 配置
forceUpdateCSP()

// 初始化 Facebook SDK
const initializeFacebookSDK = (): void => {
    // 檢查是否已經初始化過
    if (window.FB) {
        console.log('Facebook SDK already loaded')
        return
    }

    // 設定 Facebook SDK 初始化回調
    window.fbAsyncInit = () => {
        const appId = import.meta.env.VITE_FACEBOOK_APP_ID

        if (!appId || appId === 'your_facebook_app_id_here') {
            console.warn('Facebook App ID not configured. Set VITE_FACEBOOK_APP_ID in environment variables.')
            return
        }

        window.FB.init({
            appId: appId,
            cookie: true, // 啟用 cookie 以便伺服器能夠存取 session
            xfbml: true, // 解析社交外掛程式
            version: 'v19.0', // 使用最新的 Graph API 版本
        })

        console.log('Facebook SDK initialized successfully')

        // 可選：記錄頁面瀏覽事件
        if (window.FB.AppEvents) {
            window.FB.AppEvents.logEvent('PageView')
        }
    }

    // 動態載入 Facebook SDK 腳本
    const loadFacebookScript = (): void => {
        // 檢查腳本是否已經存在
        if (document.getElementById('facebook-jssdk')) {
            return
        }

        const script = document.createElement('script')
        script.id = 'facebook-jssdk'
        script.src = 'https://connect.facebook.net/en_US/sdk.js'
        script.async = true
        script.defer = true

        // 添加錯誤處理
        script.onerror = () => {
            console.error('Failed to load Facebook SDK. Please check your internet connection and CSP settings.')
        }

        script.onload = () => {
            console.log('Facebook SDK script loaded successfully')
        }

        // 插入到文檔中
        const firstScript = document.getElementsByTagName('script')[0]
        if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(script, firstScript)
        } else {
            document.head.appendChild(script)
        }
    }

    // 載入腳本
    loadFacebookScript()
}

// 在 DOM 載入後初始化 Facebook SDK
if (typeof window !== 'undefined') {
    initializeFacebookSDK()
}

// Make sure we create the root element properly
const rootElement = document.getElementById('root')

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(<AppWrapper />)
} else {
    console.error('Root element not found in the document')
}
