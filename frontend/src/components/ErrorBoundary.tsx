import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: ErrorInfo
}

/**
 * Error Boundary 元件
 * 捕獲子元件中的 JavaScript 錯誤並顯示友善的錯誤訊息
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        // 更新 state 以顯示錯誤 UI
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // 記錄錯誤到錯誤報告服務
        console.error('ErrorBoundary caught an error:', error, errorInfo)

        this.setState({
            error,
            errorInfo,
        })

        // 這裡可以將錯誤發送到錯誤追蹤服務
        // 例如：Sentry, LogRocket 等
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    render() {
        if (this.state.hasError) {
            // 如果有自定義的 fallback UI，使用它
            if (this.props.fallback) {
                return this.props.fallback
            }

            // 默認的錯誤 UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <AlertTriangle className="h-12 w-12 text-red-500" />
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mb-2">糟糕！出現了一些問題</h2>

                        <p className="text-gray-600 mb-6">
                            我們遇到了一個意外的錯誤。請嘗試重新載入頁面，或聯繫客服支援。
                        </p>

                        <div className="space-y-3">
                            <Button onClick={this.handleReset} className="w-full">
                                重試
                            </Button>

                            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                                重新載入頁面
                            </Button>
                        </div>

                        {/* 開發環境下顯示錯誤詳情 */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                    錯誤詳情 (開發模式)
                                </summary>
                                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-red-600 overflow-auto">
                                    <div className="mb-2">
                                        <strong>錯誤訊息:</strong>
                                        <br />
                                        {this.state.error.message}
                                    </div>

                                    <div className="mb-2">
                                        <strong>錯誤堆疊:</strong>
                                        <br />
                                        {this.state.error.stack}
                                    </div>

                                    {this.state.errorInfo && (
                                        <div>
                                            <strong>元件堆疊:</strong>
                                            <br />
                                            {this.state.errorInfo.componentStack}
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
