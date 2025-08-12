/**
 * 動態 CSP 配置工具
 * 根據環境變數動態生成 Content Security Policy
 */

// 從環境變數獲取 API 基礎 URL
const getApiBaseUrl = (): string => {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
}

// 驗證並標準化基礎 URL
const normalizeBaseUrl = (baseUrl: string): string => {
    try {
        const url = new URL(baseUrl)
        return `${url.protocol}//${url.host}`
    } catch (error) {
        console.warn('無法解析 API 基礎 URL:', baseUrl, error)
        return 'http://localhost:3000'
    }
}

// 動態 CSP 配置
export const generateDynamicCSP = (): string => {
    const apiBaseUrl = getApiBaseUrl()
    const baseUrl = normalizeBaseUrl(apiBaseUrl)
    const isProduction = import.meta.env.PROD
    const isDevelopment = import.meta.env.DEV

    console.log('🔒 生成動態 CSP 配置:', {
        apiBaseUrl,
        baseUrl,
        isProduction,
        isDevelopment,
        envVars: {
            VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        },
    })

    // 基礎 CSP 配置
    const cspConfig = {
        'default-src': ["'self'"],
        'script-src': [
            "'self'",
            ...(isDevelopment ? ["'unsafe-inline'", "'unsafe-eval'"] : ["'unsafe-eval'"]), // Facebook SDK needs unsafe-eval
            'https://cdn.gpteng.co',
            'https://apis.google.com',
            'https://accounts.google.com',
            'https://connect.facebook.net', // Facebook SDK
        ],
        'style-src': [
            "'self'",
            "'unsafe-inline'", // React 和 Tailwind 需要
            'https://fonts.googleapis.com',
        ],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': [
            "'self'",
            'data:',
            'https:',
            'blob:',
            baseUrl, // 動態添加 API 基礎 URL 用於圖片
        ],
        'connect-src': [
            "'self'",
            baseUrl, // 動態添加 API 基礎 URL
            'https://accounts.google.com',
            'https://www.googleapis.com',
            'https://graph.facebook.com', // Facebook Graph API
            'https://www.facebook.com', // Facebook login
            'https://connect.facebook.net', // Facebook SDK
            'https://facebook.com', // Facebook domain
            ...(isDevelopment ? ['ws://localhost:8080'] : []),
        ],
        'frame-src': [
            "'self'",
            'https://accounts.google.com',
            'https://www.facebook.com', // Facebook login frames
            'https://staticxx.facebook.com', // Facebook static resources
            'https://facebook.com', // Facebook domain
            'https://connect.facebook.net', // Facebook SDK frames
        ],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'", baseUrl], // 允許提交到後端 API
        ...(isProduction && { 'upgrade-insecure-requests': [] }),
    }

    // 生成 CSP 字串
    const cspString = Object.entries(cspConfig)
        .map(([directive, sources]) => {
            if (Array.isArray(sources) && sources.length === 0) {
                return directive.replace(/-/g, '-')
            }
            return `${directive} ${sources.join(' ')}`
        })
        .join('; ')

    console.log('🔒 生成的 CSP 字串:', cspString)
    return cspString
}

// 動態更新 CSP Meta 標籤
export const updateCSPMetaTag = (): void => {
    const cspString = generateDynamicCSP()

    // 查找現有的 CSP Meta 標籤
    let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement

    if (cspMeta) {
        // 更新現有標籤
        cspMeta.setAttribute('content', cspString)
        console.log('🔒 已更新 CSP Meta 標籤')
    } else {
        // 創建新的 CSP Meta 標籤
        cspMeta = document.createElement('meta')
        cspMeta.setAttribute('http-equiv', 'Content-Security-Policy')
        cspMeta.setAttribute('content', cspString)
        document.head.appendChild(cspMeta)
        console.log('🔒 已創建新的 CSP Meta 標籤')
    }
}

// 強制重新生成和更新 CSP
export const forceUpdateCSP = (): void => {
    console.log('🔄 強制重新生成 CSP 配置...')

    // 移除現有的 CSP Meta 標籤
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    if (existingCSP) {
        existingCSP.remove()
        console.log('🗑️ 已移除舊的 CSP Meta 標籤')
    }

    // 重新生成並設置 CSP
    updateCSPMetaTag()

    console.log('✅ CSP 強制更新完成')
}

// 驗證當前 CSP 配置
export const validateCurrentCSP = (): { isValid: boolean; issues: string[]; currentCSP: string | null } => {
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement
    const issues: string[] = []

    if (!cspMeta) {
        return {
            isValid: false,
            issues: ['未找到 CSP Meta 標籤'],
            currentCSP: null,
        }
    }

    const currentCSP = cspMeta.getAttribute('content') || ''
    const baseUrl = normalizeBaseUrl(getApiBaseUrl())

    // 檢查關鍵的 CSP 指令
    if (!currentCSP.includes('https://connect.facebook.net')) {
        issues.push('script-src 缺少 Facebook SDK 支持')
    }

    if (!currentCSP.includes('https://graph.facebook.com')) {
        issues.push('connect-src 缺少 Facebook Graph API 支持')
    }

    if (!currentCSP.includes(baseUrl)) {
        issues.push(`form-action 缺少後端 URL 支持: ${baseUrl}`)
    }

    if (!currentCSP.includes('https://www.facebook.com')) {
        issues.push('frame-src 缺少 Facebook frame 支持')
    }

    return {
        isValid: issues.length === 0,
        issues,
        currentCSP,
    }
}

// 獲取當前環境的推薦 CSP 配置（用於文件和配置參考）
export const getRecommendedCSPConfig = () => {
    const apiBaseUrl = getApiBaseUrl()
    const baseUrl = normalizeBaseUrl(apiBaseUrl)
    const isProduction = import.meta.env.PROD

    return {
        environment: isProduction ? 'production' : 'development',
        apiBaseUrl,
        baseUrl,
        recommendedCSP: generateDynamicCSP(),
        notes: {
            'img-src': `包含 ${baseUrl} 以允許從 API 伺服器載入圖片`,
            'connect-src': `包含 ${baseUrl} 以允許 API 請求`,
            dynamic: '此配置會根據 VITE_API_BASE_URL 環境變數動態調整',
        },
    }
}

export default {
    generateDynamicCSP,
    updateCSPMetaTag,
    forceUpdateCSP,
    validateCurrentCSP,
    getRecommendedCSPConfig,
}
