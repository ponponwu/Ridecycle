import React, { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, X, Eye, EyeOff, Download, Trash2 } from 'lucide-react'

interface CSPViolation {
    id: string
    timestamp: string
    directive: string
    blockedUri: string
    sourceFile: string
    lineNumber: number
    columnNumber: number
    severity: 'high' | 'medium' | 'low'
}

interface CSPViolationMonitorProps {
    maxViolations?: number
    autoHide?: boolean
    hideAfter?: number
}

const CSPViolationMonitor: React.FC<CSPViolationMonitorProps> = ({
    maxViolations = 50,
    autoHide = false,
    hideAfter = 5000,
}) => {
    const [violations, setViolations] = useState<CSPViolation[]>([])
    const [isVisible, setIsVisible] = useState(false)
    const [isMinimized, setIsMinimized] = useState(true)

    // 處理 CSP 違規事件
    const handleCSPViolation = useCallback(
        (event: SecurityPolicyViolationEvent) => {
            const violation: CSPViolation = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date().toISOString(),
                directive: event.violatedDirective,
                blockedUri: event.blockedURI,
                sourceFile: event.sourceFile,
                lineNumber: event.lineNumber,
                columnNumber: event.columnNumber,
                severity: getSeverity(event.violatedDirective),
            }

            setViolations((prev) => {
                const newViolations = [violation, ...prev].slice(0, maxViolations)
                return newViolations
            })

            // 如果是第一個違規，自動顯示監控器
            if (!isVisible) {
                setIsVisible(true)
            }

            // 自動隱藏功能
            if (autoHide) {
                setTimeout(() => {
                    setViolations((prev) => prev.filter((v) => v.id !== violation.id))
                }, hideAfter)
            }
        },
        [maxViolations, isVisible, autoHide, hideAfter]
    )

    // 設置事件監聽器
    useEffect(() => {
        document.addEventListener('securitypolicyviolation', handleCSPViolation)

        return () => {
            document.removeEventListener('securitypolicyviolation', handleCSPViolation)
        }
    }, [handleCSPViolation])

    // 獲取違規嚴重程度
    const getSeverity = (directive: string): 'high' | 'medium' | 'low' => {
        if (directive.includes('script-src') || directive.includes('object-src')) {
            return 'high'
        }
        if (directive.includes('style-src') || directive.includes('img-src')) {
            return 'medium'
        }
        return 'low'
    }

    // 獲取嚴重程度顏色
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'text-red-600 bg-red-50 border-red-200'
            case 'medium':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'low':
                return 'text-blue-600 bg-blue-50 border-blue-200'
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    // 清除所有違規
    const clearViolations = () => {
        setViolations([])
    }

    // 導出違規資料
    const exportViolations = () => {
        const data = {
            timestamp: new Date().toISOString(),
            violations: violations,
            summary: {
                total: violations.length,
                high: violations.filter((v) => v.severity === 'high').length,
                medium: violations.filter((v) => v.severity === 'medium').length,
                low: violations.filter((v) => v.severity === 'low').length,
            },
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `csp-violations-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // 移除單個違規
    const removeViolation = (id: string) => {
        setViolations((prev) => prev.filter((v) => v.id !== id))
    }

    // 格式化時間
    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString()
    }

    // 截斷長 URI
    const truncateUri = (uri: string, maxLength: number = 50) => {
        return uri.length > maxLength ? `${uri.substring(0, maxLength)}...` : uri
    }

    // 只在開發環境顯示
    if (import.meta.env.PROD) {
        return null
    }

    if (!isVisible || violations.length === 0) {
        return null
    }

    return (
        <div className="fixed bottom-20 right-4 z-50 max-w-md">
            {/* 標題欄 */}
            <div className="bg-red-600 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">CSP 違規監控</span>
                    <span className="bg-red-700 px-2 py-1 rounded text-xs">{violations.length}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 hover:bg-red-700 rounded"
                        title={isMinimized ? '展開' : '最小化'}
                    >
                        {isMinimized ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={exportViolations} className="p-1 hover:bg-red-700 rounded" title="導出違規資料">
                        <Download className="w-4 h-4" />
                    </button>
                    <button onClick={clearViolations} className="p-1 hover:bg-red-700 rounded" title="清除所有違規">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-red-700 rounded"
                        title="關閉監控器"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 違規列表 */}
            {!isMinimized && (
                <div className="bg-white border border-gray-200 rounded-b-lg shadow-lg max-h-96 overflow-y-auto">
                    {violations.map((violation) => (
                        <div
                            key={violation.id}
                            className={`p-3 border-b border-gray-100 last:border-b-0 ${getSeverityColor(
                                violation.severity
                            )}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{violation.directive}</span>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                                                violation.severity
                                            )}`}
                                        >
                                            {violation.severity.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-500">{formatTime(violation.timestamp)}</span>
                                    </div>

                                    <div className="text-sm text-gray-700 mb-1">
                                        <strong>被阻止的 URI:</strong>
                                        <br />
                                        <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                            {truncateUri(violation.blockedUri)}
                                        </code>
                                    </div>

                                    {violation.sourceFile && (
                                        <div className="text-xs text-gray-600">
                                            <strong>來源:</strong> {truncateUri(violation.sourceFile, 40)}
                                            {violation.lineNumber > 0 && <span> (行 {violation.lineNumber})</span>}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => removeViolation(violation.id)}
                                    className="ml-2 p-1 hover:bg-gray-200 rounded"
                                    title="移除此違規"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {violations.length === 0 && <div className="p-4 text-center text-gray-500">暫無 CSP 違規記錄</div>}
                </div>
            )}

            {/* 統計摘要（最小化時顯示） */}
            {isMinimized && violations.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-b-lg shadow-lg p-2">
                    <div className="flex items-center justify-between text-xs">
                        <span>最新違規: {violations[0].directive}</span>
                        <div className="flex gap-1">
                            <span className="text-red-600">
                                高: {violations.filter((v) => v.severity === 'high').length}
                            </span>
                            <span className="text-yellow-600">
                                中: {violations.filter((v) => v.severity === 'medium').length}
                            </span>
                            <span className="text-blue-600">
                                低: {violations.filter((v) => v.severity === 'low').length}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CSPViolationMonitor
