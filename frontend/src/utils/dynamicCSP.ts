/**
 * 動態 CSP 配置工具
 * 根據環境變數動態生成 Content Security Policy
 */

// 從環境變數獲取 API URL
const getApiUrl = (): string => {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/'
}

// 從 API URL 提取基礎域名
const extractBaseUrl = (apiUrl: string): string => {
    try {
        const url = new URL(apiUrl)
        return `${url.protocol}//${url.host}`
    } catch (error) {
        console.warn('無法解析 API URL:', apiUrl, error)
        return 'http://localhost:3000'
    }
}

// 動態 CSP 配置
export const generateDynamicCSP = (): string => {
    const apiUrl = getApiUrl()
    const baseUrl = extractBaseUrl(apiUrl)
    const isProduction = import.meta.env.PROD
    const isDevelopment = import.meta.env.DEV

    console.log('🔒 生成動態 CSP 配置:', {
        apiUrl,
        baseUrl,
        isProduction,
        isDevelopment,
    })

    // 基礎 CSP 配置
    const cspConfig = {
        'default-src': ["'self'"],
        'script-src': [
            "'self'",
            ...(isDevelopment ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
            'https://cdn.gpteng.co',
            'https://apis.google.com',
            'https://accounts.google.com',
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
            ...(isDevelopment ? ['ws://localhost:8080'] : []),
        ],
        'frame-src': ["'self'", 'https://accounts.google.com'],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
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

// 獲取當前環境的推薦 CSP 配置（用於文件和配置參考）
export const getRecommendedCSPConfig = () => {
    const apiUrl = getApiUrl()
    const baseUrl = extractBaseUrl(apiUrl)
    const isProduction = import.meta.env.PROD

    return {
        environment: isProduction ? 'production' : 'development',
        apiUrl,
        baseUrl,
        recommendedCSP: generateDynamicCSP(),
        notes: {
            'img-src': `包含 ${baseUrl} 以允許從 API 伺服器載入圖片`,
            'connect-src': `包含 ${baseUrl} 以允許 API 請求`,
            dynamic: '此配置會根據 VITE_API_URL 環境變數動態調整',
        },
    }
}

export default {
    generateDynamicCSP,
    updateCSPMetaTag,
    getRecommendedCSPConfig,
}
