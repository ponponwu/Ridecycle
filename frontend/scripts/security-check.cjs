#!/usr/bin/env node

/**
 * 安全檢查腳本
 * 驗證 CSP 配置和安全設定
 */

const fs = require('fs')
const path = require('path')

// 顏色輸出
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
}

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkFileExists(filePath, description) {
    const exists = fs.existsSync(filePath)
    log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`, exists ? 'green' : 'red')
    return exists
}

function checkCSPConfig() {
    log('\n🔍 檢查 CSP 配置檔案...', 'blue')

    const cspConfigPath = path.join(__dirname, '../csp-config.json')
    if (!checkFileExists(cspConfigPath, 'CSP 配置檔案')) {
        return false
    }

    try {
        const cspConfig = JSON.parse(fs.readFileSync(cspConfigPath, 'utf8'))

        // 檢查必要的環境配置
        const requiredEnvs = ['development', 'production']
        const hasAllEnvs = requiredEnvs.every((env) => {
            const exists = cspConfig.environments && cspConfig.environments[env]
            log(`${exists ? '✅' : '❌'} ${env} 環境配置`, exists ? 'green' : 'red')
            return exists
        })

        // 檢查必要的 CSP 指令
        const requiredDirectives = [
            'default-src',
            'script-src',
            'style-src',
            'img-src',
            'connect-src',
            'font-src',
            'object-src',
            'base-uri',
            'form-action',
        ]

        for (const env of requiredEnvs) {
            if (cspConfig.environments[env]) {
                log(`\n📋 檢查 ${env} 環境的 CSP 指令:`, 'yellow')
                requiredDirectives.forEach((directive) => {
                    const exists = cspConfig.environments[env][directive]
                    log(`${exists ? '✅' : '❌'} ${directive}`, exists ? 'green' : 'red')
                })
            }
        }

        return hasAllEnvs
    } catch (error) {
        log(`❌ CSP 配置檔案解析失敗: ${error.message}`, 'red')
        return false
    }
}

function checkSecurityFiles() {
    log('\n🔍 檢查安全相關檔案...', 'blue')

    const securityFiles = [
        { path: '../src/utils/security.ts', desc: '安全工具檔案' },
        { path: '../src/components/security/SecurityStatus.tsx', desc: '安全狀態組件' },
        { path: '../src/docs/SECURITY.md', desc: '安全文件' },
        { path: '../nginx.conf', desc: 'Nginx 配置' },
        { path: '../vite.config.ts', desc: 'Vite 配置' },
        { path: '../index.html', desc: 'HTML 檔案' },
    ]

    let allExist = true
    securityFiles.forEach((file) => {
        const filePath = path.join(__dirname, file.path)
        const exists = checkFileExists(filePath, file.desc)
        if (!exists) allExist = false
    })

    return allExist
}

function checkNginxConfig() {
    log('\n🔍 檢查 Nginx 安全配置...', 'blue')

    const nginxPath = path.join(__dirname, '../nginx.conf')
    if (!fs.existsSync(nginxPath)) {
        log('❌ Nginx 配置檔案不存在', 'red')
        return false
    }

    const nginxContent = fs.readFileSync(nginxPath, 'utf8')

    const securityHeaders = [
        'Content-Security-Policy',
        'Strict-Transport-Security',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
    ]

    let allHeadersPresent = true
    securityHeaders.forEach((header) => {
        const present = nginxContent.includes(header)
        log(`${present ? '✅' : '❌'} ${header}`, present ? 'green' : 'red')
        if (!present) allHeadersPresent = false
    })

    return allHeadersPresent
}

function checkViteConfig() {
    log('\n🔍 檢查 Vite 安全配置...', 'blue')

    const vitePath = path.join(__dirname, '../vite.config.ts')
    if (!fs.existsSync(vitePath)) {
        log('❌ Vite 配置檔案不存在', 'red')
        return false
    }

    const viteContent = fs.readFileSync(vitePath, 'utf8')

    const securityFeatures = [
        { pattern: 'Content-Security-Policy', desc: 'CSP 標頭' },
        { pattern: 'X-Frame-Options', desc: 'X-Frame-Options 標頭' },
        { pattern: 'terserOptions', desc: 'Terser 最小化配置' },
        { pattern: 'drop_console', desc: '生產環境移除 console' },
    ]

    let allFeaturesPresent = true
    securityFeatures.forEach((feature) => {
        const present = viteContent.includes(feature.pattern)
        log(`${present ? '✅' : '❌'} ${feature.desc}`, present ? 'green' : 'red')
        if (!present) allFeaturesPresent = false
    })

    return allFeaturesPresent
}

function checkHTMLSecurity() {
    log('\n🔍 檢查 HTML 安全設定...', 'blue')

    const htmlPath = path.join(__dirname, '../index.html')

    if (!fs.existsSync(htmlPath)) {
        log('❌ HTML 檔案不存在', 'red')
        return false
    }

    const htmlContent = fs.readFileSync(htmlPath, 'utf8')

    // 檢查動態 CSP 註釋（而不是靜態 CSP Meta 標籤）
    const cspComment = htmlContent.includes('Content Security Policy 將由 JavaScript 動態生成')
    log(`${cspComment ? '✅' : '❌'} 動態 CSP 配置註釋`, cspComment ? 'green' : 'red')

    // 檢查其他安全 Meta 標籤
    const xContentTypeOptions = htmlContent.includes('X-Content-Type-Options')
    log(`${xContentTypeOptions ? '✅' : '❌'} X-Content-Type-Options Meta`, xContentTypeOptions ? 'green' : 'red')

    const xFrameOptions = htmlContent.includes('X-Frame-Options')
    log(`${xFrameOptions ? '✅' : '❌'} X-Frame-Options Meta`, xFrameOptions ? 'green' : 'red')

    const xssProtection = htmlContent.includes('X-XSS-Protection')
    log(`${xssProtection ? '✅' : '❌'} XSS Protection Meta`, xssProtection ? 'green' : 'red')

    const referrerPolicy = htmlContent.includes('Referrer-Policy')
    log(`${referrerPolicy ? '✅' : '❌'} Referrer Policy Meta`, referrerPolicy ? 'green' : 'red')

    return cspComment && xContentTypeOptions && xFrameOptions && xssProtection && referrerPolicy
}

function generateSecurityReport() {
    log('\n📊 生成安全檢查報告...', 'blue')

    const results = {
        cspConfig: checkCSPConfig(),
        securityFiles: checkSecurityFiles(),
        nginxConfig: checkNginxConfig(),
        viteConfig: checkViteConfig(),
        htmlSecurity: checkHTMLSecurity(),
    }

    const passedChecks = Object.values(results).filter(Boolean).length
    const totalChecks = Object.keys(results).length
    const score = Math.round((passedChecks / totalChecks) * 100)

    log('\n📋 安全檢查總結:', 'bold')
    log(`通過檢查: ${passedChecks}/${totalChecks}`, passedChecks === totalChecks ? 'green' : 'yellow')
    log(`安全分數: ${score}%`, score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red')

    if (score === 100) {
        log('\n🎉 恭喜！所有安全檢查都通過了！', 'green')
    } else if (score >= 80) {
        log('\n⚠️  大部分安全檢查通過，但仍有改進空間', 'yellow')
    } else {
        log('\n🚨 安全配置需要改進，請檢查失敗的項目', 'red')
    }

    return results
}

// 主函數
function main() {
    log('🔒 RideCycle 安全檢查工具', 'bold')
    log('================================', 'blue')

    const results = generateSecurityReport()

    // 生成 JSON 報告
    const reportPath = path.join(__dirname, '../security-report.json')
    const report = {
        timestamp: new Date().toISOString(),
        results,
        recommendations: [
            '定期更新依賴套件',
            '監控 CSP 違規報告',
            '定期檢查安全配置',
            '考慮實作 Subresource Integrity (SRI)',
            '設置安全監控和警報',
        ],
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    log(`\n📄 詳細報告已儲存至: ${reportPath}`, 'blue')

    process.exit(Object.values(results).every(Boolean) ? 0 : 1)
}

// 執行檢查
if (require.main === module) {
    main()
}

module.exports = {
    checkCSPConfig,
    checkSecurityFiles,
    checkNginxConfig,
    checkViteConfig,
    checkHTMLSecurity,
    generateSecurityReport,
}
