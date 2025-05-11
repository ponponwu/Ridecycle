import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/api'
import { toast } from '@/hooks/use-toast'

const AuthCallback = () => {
    const navigate = useNavigate()

    useEffect(() => {
        // 處理 OAuth 回調
        const handleAuthCallback = async () => {
            try {
                // 從 URL 中獲取授權碼
                const url = new URL(window.location.href)
                const code = url.searchParams.get('code')
                const error = url.searchParams.get('error')

                if (code) {
                    // 使用授權碼獲取 token
                    await authService.handleOAuthCallback(code)
                    toast({
                        title: '登入成功',
                        description: '歡迎回來！',
                    })
                    navigate('/')
                } else {
                    // 沒有授權碼，可能是錯誤或取消
                    if (error) {
                        toast({
                            variant: 'destructive',
                            title: '登入失敗',
                            description: '授權過程中發生錯誤',
                        })
                    }
                    navigate('/login')
                }
            } catch (error) {
                console.error('Authentication callback error:', error)
                toast({
                    variant: 'destructive',
                    title: '登入失敗',
                    description: '處理授權回調時發生錯誤',
                })
                navigate('/login')
            }
        }

        handleAuthCallback()
    }, [navigate])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-2xl font-semibold mb-4">處理登入中...</h1>
                <p>請稍候，您將自動被重定向。</p>
            </div>
        </div>
    )
}

export default AuthCallback
