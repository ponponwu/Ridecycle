import React, { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { SecurityChecker } from '@/utils/security'

interface SecurityStatusProps {
    showInProduction?: boolean
}

interface SecurityStatus {
    secureContext: boolean
    cspSupport: boolean
    cookieSupport: boolean
    localStorageSupport: boolean
    sessionStorageSupport: boolean
    isInIframe: boolean
}

const SecurityStatus: React.FC<SecurityStatusProps> = ({ showInProduction = false }) => {
    const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // 只在開發環境或明確要求時顯示
        if (import.meta.env.DEV || showInProduction) {
            const status = {
                ...SecurityChecker.checkBrowserSecurity(),
                isInIframe: SecurityChecker.isInIframe(),
            }
            setSecurityStatus(status)
        }
    }, [showInProduction])

    // 在生產環境中且未明確要求顯示時，不渲染組件
    if (!import.meta.env.DEV && !showInProduction) {
        return null
    }

    if (!securityStatus) {
        return null
    }

    const getStatusIcon = (status: boolean) => {
        return status ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
            <XCircle className="w-4 h-4 text-red-500" />
        )
    }

    const getOverallStatus = () => {
        const criticalChecks = [securityStatus.secureContext, securityStatus.cspSupport, securityStatus.cookieSupport]

        const passedCritical = criticalChecks.filter(Boolean).length
        const totalCritical = criticalChecks.length

        if (passedCritical === totalCritical) {
            return { status: 'good', color: 'text-green-600', icon: CheckCircle }
        } else if (passedCritical >= totalCritical * 0.7) {
            return { status: 'warning', color: 'text-yellow-600', icon: AlertTriangle }
        } else {
            return { status: 'danger', color: 'text-red-600', icon: XCircle }
        }
    }

    const overall = getOverallStatus()
    const StatusIcon = overall.icon

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* 切換按鈕 */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg
                    bg-white border-2 transition-all duration-200
                    ${overall.status === 'good' ? 'border-green-200 hover:border-green-300' : ''}
                    ${overall.status === 'warning' ? 'border-yellow-200 hover:border-yellow-300' : ''}
                    ${overall.status === 'danger' ? 'border-red-200 hover:border-red-300' : ''}
                    hover:shadow-xl
                `}
                title="點擊查看安全狀態詳情"
            >
                <Shield className={`w-5 h-5 ${overall.color}`} />
                <StatusIcon className={`w-4 h-4 ${overall.color}`} />
                {import.meta.env.DEV && <span className={`text-sm font-medium ${overall.color}`}>安全狀態</span>}
            </button>

            {/* 詳細狀態面板 */}
            {isVisible && (
                <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                        <Shield className={`w-5 h-5 ${overall.color}`} />
                        <h3 className="font-semibold text-gray-800">安全狀態檢查</h3>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="ml-auto text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* 關鍵安全檢查 */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">關鍵安全功能</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">安全上下文 (HTTPS)</span>
                                    {getStatusIcon(securityStatus.secureContext)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">CSP 支援</span>
                                    {getStatusIcon(securityStatus.cspSupport)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Cookie 支援</span>
                                    {getStatusIcon(securityStatus.cookieSupport)}
                                </div>
                            </div>
                        </div>

                        {/* 其他檢查 */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">其他功能</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">localStorage 支援</span>
                                    {getStatusIcon(securityStatus.localStorageSupport)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">sessionStorage 支援</span>
                                    {getStatusIcon(securityStatus.sessionStorageSupport)}
                                </div>
                            </div>
                        </div>

                        {/* 安全警告 */}
                        {securityStatus.isInIframe && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                    <span className="text-sm text-yellow-800">應用在 iframe 中運行</span>
                                </div>
                            </div>
                        )}

                        {!securityStatus.secureContext && import.meta.env.PROD && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-sm text-red-800">未在安全上下文中運行</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 環境資訊 */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>環境: {import.meta.env.DEV ? '開發' : '生產'}</span>
                            <span>協議: {window.location.protocol}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SecurityStatus
