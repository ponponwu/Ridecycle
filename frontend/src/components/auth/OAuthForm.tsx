import { useRef, useEffect, useState, forwardRef } from 'react';

interface OAuthFormProps {
  provider: 'google_oauth2' | 'facebook';
  onSubmit?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// 獲取後端 API 基礎 URL
const getBackendBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
};

export const OAuthForm = forwardRef<HTMLFormElement, OAuthFormProps>(
  ({ provider, onSubmit, className, style }, ref) => {
    const [csrfToken, setCsrfToken] = useState<string>('');
    const backendBaseUrl = getBackendBaseUrl();

    useEffect(() => {
      // 獲取 CSRF token
      const fetchCSRFToken = async () => {
        try {
          const response = await fetch(`${backendBaseUrl}/api/v1/csrf_token`, {
            credentials: 'include'
          });
          const data = await response.json();
          if (data.token) {
            setCsrfToken(data.token);
          }
        } catch (error) {
          console.error('Failed to fetch CSRF token:', error);
        }
      };

      fetchCSRFToken();
    }, [backendBaseUrl]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      
      // 在開發環境中記錄表單提交信息
      if (import.meta.env.DEV) {
        console.log('🔐 OAuth form submission:', {
          provider,
          action: form.action,
          method: form.method,
          csrfToken: csrfToken ? 'present' : 'missing',
          backendBaseUrl
        });
      }
      
      if (onSubmit) {
        onSubmit();
      }
      
      // 檢查必要條件
      if (!csrfToken) {
        console.error('❌ CSRF token is missing, form submission may fail');
      }
      
      // 直接提交表單
      setTimeout(() => form.submit(), 0);
    };

    return (
      <form
        ref={ref}
        method="POST"
        action={`${backendBaseUrl}/auth/${provider}`}
        onSubmit={handleSubmit}
        className={className}
        style={style}
      >
        {csrfToken && (
          <input
            type="hidden"
            name="authenticity_token"
            value={csrfToken}
          />
        )}
      </form>
    );
  }
);