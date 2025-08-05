/**
 * Facebook SDK 狀態檢查工具
 * 用於診斷 Facebook SDK 載入和初始化問題
 */

interface FacebookSDKStatus {
    isSDKLoaded: boolean
    isSDKInitialized: boolean
    hasError: boolean
    errorMessage?: string
    appId?: string
    sdkVersion?: string
    scriptTagExists: boolean
    sdkReadyState: 'loading' | 'ready' | 'error' | 'unknown'
}

export const checkFacebookSDKStatus = async (): Promise<FacebookSDKStatus> => {
    const status: FacebookSDKStatus = {
        isSDKLoaded: false,
        isSDKInitialized: false,
        hasError: false,
        scriptTagExists: false,
        sdkReadyState: 'unknown',
    }

    try {
        // 檢查 Facebook SDK 腳本標籤是否存在
        const scriptTags = document.querySelectorAll('script[src*="connect.facebook.net"]')
        status.scriptTagExists = scriptTags.length > 0

        // 檢查 Facebook SDK 是否載入
        if (typeof window !== 'undefined' && window.FB) {
            status.isSDKLoaded = true
            status.sdkReadyState = 'ready'

            // 檢查 SDK 是否初始化
            if (window.FB.getAccessToken || window.FB.api) {
                status.isSDKInitialized = true
            }

            // 獲取 SDK 版本
            if (window.FB.getVersion) {
                status.sdkVersion = window.FB.getVersion()
            }
        } else if (status.scriptTagExists) {
            // 腳本存在但 SDK 未載入，可能還在載入中
            status.sdkReadyState = 'loading'
        } else {
            // 既沒有腳本標籤也沒有 SDK
            status.sdkReadyState = 'error'
        }

        // 獲取 App ID
        const appId = import.meta.env.VITE_FACEBOOK_APP_ID
        if (appId && appId !== 'your_facebook_app_id_here') {
            status.appId = appId
        }
    } catch (error) {
        status.hasError = true
        status.errorMessage = error instanceof Error ? error.message : 'Unknown error'
        status.sdkReadyState = 'error'
        console.error('Facebook SDK status check failed:', error)
    }

    return status
}

export const logFacebookSDKStatus = async (): Promise<void> => {
    const status = await checkFacebookSDKStatus()

    console.group('🔍 Facebook SDK Status Check')
    console.log('SDK Loaded:', status.isSDKLoaded ? '✅' : '❌')
    console.log('SDK Initialized:', status.isSDKInitialized ? '✅' : '❌')
    console.log('Script Tag Exists:', status.scriptTagExists ? '✅' : '❌')
    console.log('SDK Ready State:', status.sdkReadyState)
    console.log('App ID:', status.appId || '❌ Not configured')
    console.log('SDK Version:', status.sdkVersion || '❌ Unknown')

    if (status.hasError) {
        console.error('Error:', status.errorMessage)
    }

    // 提供診斷建議
    if (!status.isSDKLoaded) {
        if (!status.scriptTagExists) {
            console.warn(
                '💡 No Facebook SDK script tag found. The native Facebook SDK should be loaded by main.tsx.'
            )
        } else if (status.sdkReadyState === 'loading') {
            console.warn('💡 Facebook SDK is still loading. Please wait or check for loading errors.')
        } else {
            console.warn('💡 Facebook SDK script exists but not loaded. Check CSP configuration or console errors.')
        }
    }
    if (!status.appId) {
        console.warn('💡 Facebook App ID not configured. Check VITE_FACEBOOK_APP_ID environment variable.')
    }

    console.groupEnd()
}

// 監聽 Facebook SDK 載入事件
export const waitForFacebookSDK = (timeout = 15000): Promise<boolean> => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.FB) {
            resolve(true)
            return
        }

        let attempts = 0
        const maxAttempts = timeout / 200 // 檢查間隔改為 200ms

        const checkSDK = () => {
            attempts++

            if (typeof window !== 'undefined' && window.FB) {
                console.log('✅ Facebook SDK loaded successfully')
                resolve(true)
            } else if (attempts >= maxAttempts) {
                console.warn('❌ Facebook SDK loading timeout after', timeout, 'ms')
                resolve(false)
            } else {
                // 提供載入進度反饋
                if (attempts % 25 === 0) {
                    // 每 5 秒記錄一次
                    console.log(`⏳ Still waiting for Facebook SDK... (${attempts * 200}ms elapsed)`)
                }
                setTimeout(checkSDK, 200)
            }
        }

        setTimeout(checkSDK, 200)
    })
}

// 更智能的 Facebook SDK 載入檢查
export const waitForFacebookSDKWithRetry = async (maxRetries = 3, timeout = 15000): Promise<boolean> => {
    for (let retry = 0; retry < maxRetries; retry++) {
        console.log(`🔄 Facebook SDK loading attempt ${retry + 1}/${maxRetries}`)

        const result = await waitForFacebookSDK(timeout)
        if (result) {
            return true
        }

        // 如果不是最後一次嘗試，等待一段時間再重試
        if (retry < maxRetries - 1) {
            console.log('⏳ Waiting 2 seconds before retry...')
            await new Promise((resolve) => setTimeout(resolve, 2000))
        }
    }

    console.error('❌ Facebook SDK failed to load after', maxRetries, 'attempts')
    return false
}

// 在開發環境中自動運行檢查
if (import.meta.env.DEV) {
    // 延遲檢查，確保 DOM 已載入
    setTimeout(() => {
        logFacebookSDKStatus()
    }, 2000)
}

export default {
    checkFacebookSDKStatus,
    logFacebookSDKStatus,
    waitForFacebookSDK,
}
