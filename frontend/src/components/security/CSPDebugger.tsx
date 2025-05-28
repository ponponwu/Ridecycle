import React, { useState, useEffect } from 'react'
import { Bug, Eye, EyeOff, Copy, Check, AlertTriangle } from 'lucide-react'

interface CSPViolation {
    blockedURI: string
    violatedDirective: string
    originalPolicy: string
    [key: string]: unknown
}

interface CSPInfo {
    metaCSP: string | null
    headerCSP: string | null
    violations: CSPViolation[]
    apiUrl: string
    baseUrl: string
}

const CSPDebugger: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [cspInfo, setCspInfo] = useState<CSPInfo | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (isVisible) {
            collectCSPInfo()
        }
    }, [isVisible])

    const collectCSPInfo = () => {
        // 獲取 Meta 標籤中的 CSP
        const metaCSP =
            document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content') || null

        // 嘗試從 Response Headers 獲取 CSP（通常無法直接訪問）
        const headerCSP = null // 瀏覽器安全限制，無法直接讀取

        // 獲取 API URL 和基礎 URL
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/'
        const baseUrl = extractBaseUrl(apiUrl)

        // 獲取 CSP 違規記錄（如果有的話）
        const violations = (window as unknown as { cspViolations?: CSPViolation[] }).cspViolations || []

        setCspInfo({
            metaCSP,
            headerCSP,
            violations,
            apiUrl,
            baseUrl,
        })
    }

    const extractBaseUrl = (apiUrl: string): string => {
        try {
            const url = new URL(apiUrl)
            return `${url.protocol}//${url.host}`
        } catch (error) {
            return 'http://localhost:3000'
        }
    }

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('複製失敗:', error)
        }
    }

    const parseCSPDirectives = (csp: string) => {
        const directives: Record<string, string[]> = {}
        const parts = csp
            .split(';')
            .map((part) => part.trim())
            .filter(Boolean)

        parts.forEach((part) => {
            const [directive, ...sources] = part.split(' ')
            if (directive) {
                directives[directive] = sources
            }
        })

        return directives
    }

    const checkImageSrcInclusion = (csp: string, baseUrl: string) => {
        const directives = parseCSPDirectives(csp)
        const imgSrc = directives['img-src'] || []
        return imgSrc.includes(baseUrl)
    }

    // 只在開發環境顯示
    if (import.meta.env.PROD || !cspInfo) {
        return (
            <>
                {!import.meta.env.PROD && (
                    <button
                        onClick={() => setIsVisible(true)}
                        className="fixed bottom-20 left-4 z-50 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                        title="CSP 除錯器"
                    >
                        <Bug className="w-5 h-5" />
                    </button>
                )}
            </>
        )
    }

    return (
        <>
            {/* 浮動按鈕 */}
            {!isVisible && (
                <button
                    onClick={() => setIsVisible(true)}
                    className="fixed bottom-20 left-4 z-50 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                    title="CSP 除錯器"
                >
                    <Bug className="w-5 h-5" />
                </button>
            )}

            {/* 除錯面板 */}
            {isVisible && (
                <div className="fixed bottom-4 left-4 z-50 bg-white border border-red-200 rounded-lg shadow-xl max-w-4xl max-h-96 overflow-y-auto">
                    {/* 標題欄 */}
                    <div className="bg-red-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bug className="w-4 h-4" />
                            <span className="font-medium">CSP 除錯器</span>
                            <span className="bg-red-700 px-2 py-1 rounded text-xs">開發環境</span>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-1 hover:bg-red-700 rounded"
                            title="關閉"
                        >
                            ×
                        </button>
                    </div>

                    {/* 內容 */}
                    <div className="p-4 space-y-4">
                        {/* 基本資訊 */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">環境資訊</h3>
                            <div className="bg-gray-100 p-3 rounded text-sm space-y-1">
                                <div>
                                    <strong>API URL:</strong> {cspInfo.apiUrl}
                                </div>
                                <div>
                                    <strong>基礎 URL:</strong> {cspInfo.baseUrl}
                                </div>
                            </div>
                        </div>

                        {/* Meta CSP */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-800">Meta 標籤 CSP</h3>
                                {cspInfo.metaCSP && (
                                    <button
                                        onClick={() => copyToClipboard(cspInfo.metaCSP!)}
                                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-3 h-3 text-green-600" />
                                                已複製
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3 h-3" />
                                                複製
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            {cspInfo.metaCSP ? (
                                <div className="bg-green-50 border border-green-200 p-3 rounded">
                                    <div className="text-green-800 text-xs font-mono break-all">{cspInfo.metaCSP}</div>
                                    <div className="mt-2 text-sm">
                                        <strong className="text-green-700">img-src 檢查:</strong>
                                        <span
                                            className={`ml-2 ${
                                                checkImageSrcInclusion(cspInfo.metaCSP, cspInfo.baseUrl)
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {checkImageSrcInclusion(cspInfo.metaCSP, cspInfo.baseUrl)
                                                ? '✅ 包含基礎 URL'
                                                : '❌ 未包含基礎 URL'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 border border-red-200 p-3 rounded">
                                    <div className="flex items-center gap-2 text-red-700">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="text-sm">未找到 Meta CSP 標籤</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CSP 違規 */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">CSP 違規記錄</h3>
                            {cspInfo.violations.length > 0 ? (
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded max-h-32 overflow-y-auto">
                                    {cspInfo.violations.map((violation, index) => (
                                        <div key={index} className="text-xs text-yellow-800 mb-1">
                                            {JSON.stringify(violation)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 p-3 rounded">
                                    <span className="text-green-700 text-sm">✅ 無 CSP 違規記錄</span>
                                </div>
                            )}
                        </div>

                        {/* 操作按鈕 */}
                        <div className="flex gap-2">
                            <button
                                onClick={collectCSPInfo}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                                重新檢查
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                                重新載入頁面
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default CSPDebugger
