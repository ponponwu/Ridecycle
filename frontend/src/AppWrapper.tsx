import React from 'react'
import App from './App'
import SecurityStatus from './components/security/SecurityStatus'
import CSPViolationMonitor from './components/security/CSPViolationMonitor'
import CSPConfigChecker from './components/security/CSPConfigChecker'
import CSPDebugger from './components/security/CSPDebugger'

// 檢查是否為生產環境
const isProduction = import.meta.env.PROD

// 根據環境決定是否使用 StrictMode
const AppWrapper = () => {
    return (
        <>
            {isProduction ? (
                <App />
            ) : (
                <React.StrictMode>
                    <App />
                </React.StrictMode>
            )}
            {/* 安全狀態組件 - 只在開發環境顯示 */}
            <SecurityStatus />
            {/* CSP 違規監控組件 - 只在開發環境顯示 */}
            <CSPViolationMonitor />
            {/* CSP 配置檢查器 - 只在開發環境顯示 */}
            <CSPConfigChecker />
            {/* CSP 除錯器 - 只在開發環境顯示 */}
            <CSPDebugger />
        </>
    )
}

export default AppWrapper
