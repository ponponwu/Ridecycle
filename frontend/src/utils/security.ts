/**
 * 安全工具類別
 * 提供 CSP 違規報告、安全檢查等功能
 */

// CSP 違規報告介面
interface CSPViolationReport {
    'csp-report': {
        'document-uri': string
        referrer: string
        'violated-directive': string
        'effective-directive': string
        'original-policy': string
        'blocked-uri': string
        'line-number': number
        'column-number': number
        'source-file': string
    }
}

// 生產環境違規報告介面
interface ProductionViolationReport {
    timestamp: string
    userAgent: string
    url: string
    violation: {
        directive: string
        blockedUri: string
        sourceFile: string
        lineNumber: number
        columnNumber: number
    }
    sessionInfo: {
        sessionId: string
        userId?: string
        ipAddress?: string
    }
}

// 安全配置
export const SECURITY_CONFIG = {
    // CSP 設定
    csp: {
        // 開發環境 CSP
        development: {
            'default-src': ["'self'"],
            'script-src': [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                'https://cdn.gpteng.co',
                'https://apis.google.com',
                'https://accounts.google.com',
            ],
            'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            'font-src': ["'self'", 'https://fonts.gstatic.com'],
            'img-src': ["'self'", 'data:', 'https:', 'blob:'],
            'connect-src': [
                "'self'",
                'http://localhost:3000',
                'https://localhost:3000',
                'https://accounts.google.com',
                'ws://localhost:8080',
            ],
            'frame-src': ["'self'", 'https://accounts.google.com'],
            'object-src': ["'none'"],
            'base-uri': ["'self'"],
            'form-action': ["'self'"],
        },
        // 生產環境 CSP
        production: {
            'default-src': ["'self'"],
            'script-src': ["'self'", 'https://cdn.gpteng.co', 'https://apis.google.com', 'https://accounts.google.com'],
            'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            'font-src': ["'self'", 'https://fonts.gstatic.com'],
            'img-src': ["'self'", 'data:', 'https:', 'blob:'],
            'connect-src': ["'self'", 'https://api.ridecycle.com', 'https://accounts.google.com'],
            'frame-src': ["'self'", 'https://accounts.google.com'],
            'object-src': ["'none'"],
            'base-uri': ["'self'"],
            'form-action': ["'self'"],
            'upgrade-insecure-requests': [],
        },
    },

    // 安全標頭
    headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
    },

    // 生產環境配置
    production: {
        // CSP 違規報告端點
        reportUri: '/api/v1/security/csp-violations',
        // 批次報告設定
        batchReporting: {
            enabled: true,
            maxBatchSize: 10,
            flushInterval: 30000, // 30 秒
        },
        // 報告過濾設定
        reportFilters: {
            // 忽略的違規類型
            ignoredDirectives: [],
            // 忽略的 URI 模式
            ignoredUriPatterns: [/chrome-extension:/, /moz-extension:/, /safari-extension:/, /about:blank/],
            // 最大報告頻率（每分鐘）
            maxReportsPerMinute: 10,
        },
    },
}

/**
 * 生產環境 CSP 違規報告管理器
 */
class ProductionViolationReporter {
    private reportQueue: ProductionViolationReport[] = []
    private reportCounts: Map<string, number> = new Map()
    private lastFlush: number = Date.now()

    constructor() {
        // 定期清理報告計數
        setInterval(() => {
            this.reportCounts.clear()
        }, 60000) // 每分鐘清理一次

        // 定期發送批次報告
        if (SECURITY_CONFIG.production.batchReporting.enabled) {
            setInterval(() => {
                this.flushReports()
            }, SECURITY_CONFIG.production.batchReporting.flushInterval)
        }

        // 頁面卸載時發送剩餘報告
        window.addEventListener('beforeunload', () => {
            this.flushReports(true)
        })
    }

    /**
     * 添加違規報告到隊列
     */
    addReport(violation: CSPViolationReport): void {
        const report = this.createProductionReport(violation)

        // 檢查是否應該忽略此違規
        if (this.shouldIgnoreViolation(violation)) {
            return
        }

        // 檢查報告頻率限制
        const violationKey = `${violation['csp-report']['violated-directive']}-${violation['csp-report']['blocked-uri']}`
        const currentCount = this.reportCounts.get(violationKey) || 0

        if (currentCount >= SECURITY_CONFIG.production.reportFilters.maxReportsPerMinute) {
            console.warn('CSP 違規報告頻率限制：', violationKey)
            return
        }

        this.reportCounts.set(violationKey, currentCount + 1)
        this.reportQueue.push(report)

        // 如果隊列滿了，立即發送
        if (this.reportQueue.length >= SECURITY_CONFIG.production.batchReporting.maxBatchSize) {
            this.flushReports()
        }
    }

    /**
     * 創建生產環境報告格式
     */
    private createProductionReport(violation: CSPViolationReport): ProductionViolationReport {
        return {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            violation: {
                directive: violation['csp-report']['violated-directive'],
                blockedUri: violation['csp-report']['blocked-uri'],
                sourceFile: violation['csp-report']['source-file'],
                lineNumber: violation['csp-report']['line-number'],
                columnNumber: violation['csp-report']['column-number'],
            },
            sessionInfo: {
                sessionId: this.getSessionId(),
                userId: this.getCurrentUserId(),
                ipAddress: undefined, // 由後端填入
            },
        }
    }

    /**
     * 檢查是否應該忽略此違規
     */
    private shouldIgnoreViolation(violation: CSPViolationReport): boolean {
        const blockedUri = violation['csp-report']['blocked-uri']
        const directive = violation['csp-report']['violated-directive']

        // 檢查忽略的指令
        if (SECURITY_CONFIG.production.reportFilters.ignoredDirectives.includes(directive)) {
            return true
        }

        // 檢查忽略的 URI 模式
        return SECURITY_CONFIG.production.reportFilters.ignoredUriPatterns.some((pattern) => pattern.test(blockedUri))
    }

    /**
     * 發送批次報告到後端
     */
    private async flushReports(isBeforeUnload: boolean = false): Promise<void> {
        if (this.reportQueue.length === 0) {
            return
        }

        const reports = [...this.reportQueue]
        this.reportQueue = []

        try {
            const response = await fetch(SECURITY_CONFIG.production.reportUri, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    reports,
                    metadata: {
                        batchSize: reports.length,
                        timestamp: new Date().toISOString(),
                        isBeforeUnload,
                    },
                }),
                // 如果是頁面卸載，使用 keepalive
                ...(isBeforeUnload && { keepalive: true }),
            })

            if (!response.ok) {
                console.error('CSP 違規報告發送失敗:', response.status)
                // 如果發送失敗，將報告放回隊列（除非是頁面卸載）
                if (!isBeforeUnload) {
                    this.reportQueue.unshift(...reports)
                }
            }
        } catch (error) {
            console.error('CSP 違規報告發送錯誤:', error)
            // 如果發送失敗，將報告放回隊列（除非是頁面卸載）
            if (!isBeforeUnload) {
                this.reportQueue.unshift(...reports)
            }
        }
    }

    /**
     * 獲取會話 ID
     */
    private getSessionId(): string {
        let sessionId = sessionStorage.getItem('security-session-id')
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
            sessionStorage.setItem('security-session-id', sessionId)
        }
        return sessionId
    }

    /**
     * 獲取當前用戶 ID（如果已登入）
     */
    private getCurrentUserId(): string | undefined {
        // 這裡可以整合您的認證系統
        // 例如從 AuthContext 或 cookie 中獲取用戶 ID
        try {
            // 假設您有一個全域的用戶狀態
            // return window.__CURRENT_USER__?.id
            return undefined
        } catch {
            return undefined
        }
    }
}

// 全域違規報告器實例
let violationReporter: ProductionViolationReporter | null = null

/**
 * 生成 CSP 字串
 */
export const generateCSPString = (environment: 'development' | 'production' = 'production'): string => {
    const cspConfig = SECURITY_CONFIG.csp[environment]

    return Object.entries(cspConfig)
        .map(([directive, sources]) => {
            if (sources.length === 0) {
                return directive.replace(/-/g, '-')
            }
            return `${directive} ${sources.join(' ')}`
        })
        .join('; ')
}

/**
 * CSP 違規報告處理器
 */
export const handleCSPViolation = (report: CSPViolationReport): void => {
    const violation = report['csp-report']

    console.warn('🚨 CSP 違規檢測:', {
        directive: violation['violated-directive'],
        blockedUri: violation['blocked-uri'],
        sourceFile: violation['source-file'],
        lineNumber: violation['line-number'],
        documentUri: violation['document-uri'],
    })

    // 在開發環境中顯示詳細資訊
    if (import.meta.env.DEV) {
        console.group('🔍 CSP 違規詳細資訊')
        console.log('違規指令:', violation['violated-directive'])
        console.log('被阻止的 URI:', violation['blocked-uri'])
        console.log('來源檔案:', violation['source-file'])
        console.log('行號:', violation['line-number'])
        console.log('列號:', violation['column-number'])
        console.log('完整政策:', violation['original-policy'])
        console.groupEnd()
    }

    // 在生產環境中發送到後端
    if (import.meta.env.PROD && violationReporter) {
        violationReporter.addReport(report)
    }
}

/**
 * 設置 CSP 違規監聽器
 */
export const setupCSPViolationListener = (): void => {
    // 初始化生產環境報告器
    if (import.meta.env.PROD) {
        violationReporter = new ProductionViolationReporter()
    }

    document.addEventListener('securitypolicyviolation', (event) => {
        const report: CSPViolationReport = {
            'csp-report': {
                'document-uri': event.documentURI,
                referrer: document.referrer,
                'violated-directive': event.violatedDirective,
                'effective-directive': event.effectiveDirective,
                'original-policy': event.originalPolicy,
                'blocked-uri': event.blockedURI,
                'line-number': event.lineNumber,
                'column-number': event.columnNumber,
                'source-file': event.sourceFile,
            },
        }

        handleCSPViolation(report)
    })
}

/**
 * 安全檢查工具
 */
export const SecurityChecker = {
    /**
     * 檢查是否在安全上下文中（HTTPS）
     */
    isSecureContext(): boolean {
        return window.isSecureContext
    },

    /**
     * 檢查是否支援 CSP
     */
    supportsCSP(): boolean {
        return 'SecurityPolicyViolationEvent' in window
    },

    /**
     * 檢查瀏覽器安全功能支援
     */
    checkBrowserSecurity(): {
        secureContext: boolean
        cspSupport: boolean
        cookieSupport: boolean
        localStorageSupport: boolean
        sessionStorageSupport: boolean
    } {
        return {
            secureContext: this.isSecureContext(),
            cspSupport: this.supportsCSP(),
            cookieSupport: navigator.cookieEnabled,
            localStorageSupport: typeof Storage !== 'undefined',
            sessionStorageSupport: typeof sessionStorage !== 'undefined',
        }
    },

    /**
     * 驗證 URL 是否安全
     */
    isSecureURL(url: string): boolean {
        try {
            const urlObj = new URL(url)
            return urlObj.protocol === 'https:' || urlObj.hostname === 'localhost'
        } catch {
            return false
        }
    },

    /**
     * 清理用戶輸入以防止 XSS
     */
    sanitizeInput(input: string): string {
        const div = document.createElement('div')
        div.textContent = input
        return div.innerHTML
    },

    /**
     * 檢查是否在 iframe 中
     */
    isInIframe(): boolean {
        return window !== window.top
    },
}

/**
 * 初始化安全設定
 */
export const initializeSecurity = (): void => {
    // 設置 CSP 違規監聽器
    setupCSPViolationListener()

    // 檢查瀏覽器安全功能
    const securityStatus = SecurityChecker.checkBrowserSecurity()

    if (import.meta.env.DEV) {
        console.group('🔒 安全狀態檢查')
        console.log('安全上下文:', securityStatus.secureContext ? '✅' : '❌')
        console.log('CSP 支援:', securityStatus.cspSupport ? '✅' : '❌')
        console.log('Cookie 支援:', securityStatus.cookieSupport ? '✅' : '❌')
        console.groupEnd()
    }

    // 如果在 iframe 中，發出警告
    if (SecurityChecker.isInIframe()) {
        console.warn('⚠️ 應用正在 iframe 中運行，可能存在安全風險')
    }

    // 如果不在安全上下文中，發出警告
    if (!securityStatus.secureContext && import.meta.env.PROD) {
        console.warn('⚠️ 應用未在安全上下文（HTTPS）中運行')
    }
}

export default {
    SECURITY_CONFIG,
    generateCSPString,
    handleCSPViolation,
    setupCSPViolationListener,
    SecurityChecker,
    initializeSecurity,
}
