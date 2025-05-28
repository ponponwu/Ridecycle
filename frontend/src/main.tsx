import React from 'react'
import ReactDOM from 'react-dom/client'
import AppWrapper from './AppWrapper'
import './index.css'
import './i18n'
import { initializeSecurity } from './utils/security'
import { updateCSPMetaTag } from './utils/dynamicCSP'

// 初始化安全設定
initializeSecurity()

// 動態更新 CSP 配置
updateCSPMetaTag()

// Make sure we create the root element properly
const rootElement = document.getElementById('root')

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(<AppWrapper />)
} else {
    console.error('Root element not found in the document')
}
