import React, { useState, useEffect } from 'react'
import { Settings, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { getRecommendedCSPConfig } from '@/utils/dynamicCSP'

interface CSPConfigInfo {
    environment: string
    apiUrl: string
    baseUrl: string
    recommendedCSP: string
    notes: Record<string, string>
}

const CSPConfigChecker: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [configInfo, setConfigInfo] = useState<CSPConfigInfo | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        // 獲取當前配置資訊
        const info = getRecommendedCSPConfig()
        setConfigInfo(info)
    }, [])

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('複製失敗:', error)
        }
    }

    // 只在開發環境顯示
    if (import.meta.env.PROD || !configInfo) {
        return null
    }

    return (
        <>
            {/* 浮動按鈕 */}
            {!isVisible && (
                <button
                    onClick={() => setIsVisible(true)}
                    className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    title="檢查 CSP 配置"
                >
                    <Settings className="w-5 h-5" />
                </button>
            )}

            {/* 配置面板 */}
            {isVisible && (
                <div className="fixed bottom-4 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-w-2xl">
                    {/* 標題欄 */}
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            <span className="font-medium">CSP 動態配置</span>
                            <span className="bg-blue-700 px-2 py-1 rounded text-xs">{configInfo.environment}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1 hover:bg-blue-700 rounded"
                                title={isExpanded ? '收起' : '展開'}
                            >
                                {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="p-1 hover:bg-blue-700 rounded"
                                title="關閉"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* 基本資訊 */}
                    <div className="p-4">
                        <div className="grid grid-cols-1 gap-3 text-sm">
                            <div>
                                <strong className="text-gray-700">API URL:</strong>
                                <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs break-all">
                                    {configInfo.apiUrl}
                                </div>
                            </div>
                            <div>
                                <strong className="text-gray-700">基礎 URL:</strong>
                                <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs">
                                    {configInfo.baseUrl}
                                </div>
                            </div>
                        </div>

                        {/* 展開的詳細配置 */}
                        {isExpanded && (
                            <div className="mt-4 space-y-3">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <strong className="text-gray-700">生成的 CSP 配置:</strong>
                                        <button
                                            onClick={() => copyToClipboard(configInfo.recommendedCSP)}
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
                                    </div>
                                    <div className="bg-gray-100 p-3 rounded font-mono text-xs max-h-32 overflow-y-auto">
                                        {configInfo.recommendedCSP}
                                    </div>
                                </div>

                                <div>
                                    <strong className="text-gray-700">配置說明:</strong>
                                    <div className="mt-2 space-y-2">
                                        {Object.entries(configInfo.notes).map(([key, value]) => (
                                            <div key={key} className="bg-blue-50 p-2 rounded text-xs">
                                                <strong className="text-blue-800">{key}:</strong>
                                                <span className="text-blue-700 ml-1">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-yellow-50 p-3 rounded">
                                    <div className="text-yellow-800 text-xs">
                                        <strong>💡 提示:</strong>
                                        <ul className="mt-1 space-y-1 list-disc list-inside">
                                            <li>此配置會根據 VITE_API_BASE_URL 環境變數自動調整</li>
                                            <li>在 Zeabur 等平台部署時，設定正確的 VITE_API_BASE_URL</li>
                                            <li>img-src 和 connect-src 會自動包含 API 基礎域名</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default CSPConfigChecker
