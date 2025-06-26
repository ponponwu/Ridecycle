import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from 'lovable-tagger'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: '::',
        port: 8080,
        // 開發環境安全標頭
        headers: {
            // Content Security Policy
            'Content-Security-Policy': `
                default-src 'self';
                script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co https://apis.google.com https://accounts.google.com;
                style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
                font-src 'self' https://fonts.gstatic.com;
                img-src 'self' data: https: blob: http://localhost:3000;
                connect-src 'self' http://localhost:3000 https://localhost:3000 https://accounts.google.com ws://localhost:8080;
                frame-src 'self' https://accounts.google.com;
                object-src 'none';
                base-uri 'self';
                form-action 'self';
            `
                .replace(/\s+/g, ' ')
                .trim(),

            // 其他安全標頭
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',

            // 權限政策
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
        },
    },
    plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    // 建置時的安全設定
    build: {
        // 啟用 source map 但不包含在生產版本中
        sourcemap: mode === 'development',
        // 最小化輸出
        minify: 'terser',
        terserOptions: {
            compress: {
                // 移除 console.log（生產環境）
                drop_console: mode === 'production',
                drop_debugger: true,
            },
        },
        // 分割代碼以提高安全性
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    router: ['react-router-dom'],
                    ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
                },
            },
        },
    },
}))
