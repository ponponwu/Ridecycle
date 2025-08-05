import { useState, useEffect } from 'react';
import { facebookAuthService } from '@/services/facebookAuth.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface UseFacebookAuthReturn {
  signInWithFacebook: () => Promise<void>;
  handleFacebookError: (error: unknown) => void;
  signInWithRedirect: () => void;
  error: string | null;
  isLoading: boolean;
}

export const useFacebookAuth = (): UseFacebookAuthReturn => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    // 監聽 Facebook 登入成功事件
    const handleFacebookLoginSuccess = (event: CustomEvent) => {
      setIsLoading(false);
      toast({
        title: t('auth.loginSuccess'),
        description: t('auth.facebookLoginSuccessMessage'),
      });
      refreshUser();
    };

    // 監聽 Facebook 登入錯誤事件
    const handleFacebookLoginError = (event: CustomEvent) => {
      setIsLoading(false);
      const errorMessage = event.detail?.message || t('auth.facebookLoginFailedMessage');
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: t('auth.facebookLoginFailed'),
        description: errorMessage,
      });
    };

    window.addEventListener('facebookLoginSuccess', handleFacebookLoginSuccess as EventListener);
    window.addEventListener('facebookLoginError', handleFacebookLoginError as EventListener);

    return () => {
      window.removeEventListener('facebookLoginSuccess', handleFacebookLoginSuccess as EventListener);
      window.removeEventListener('facebookLoginError', handleFacebookLoginError as EventListener);
    };
  }, [refreshUser, t]);

  const signInWithFacebook = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await facebookAuthService.signInWithFacebook();
      // 成功會通過事件處理，這裡不需要額外處理
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      facebookAuthService.handleLoginError(err);
    }
  };

  const handleFacebookError = (error: unknown): void => {
    setIsLoading(false);
    
    // 檢查是否為 facebookNotLoaded 錯誤，如果是則提供更好的錯誤訊息
    if (error && typeof error === 'object' && 'status' in error && error.status === 'facebookNotLoaded') {
      const errorMessage = t('auth.facebookSDKNotLoaded') || 'Facebook SDK not loaded. Please check your internet connection or try the alternative login method.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: t('auth.facebookLoginFailed'),
        description: errorMessage,
      });
    } else {
      facebookAuthService.handleLoginError(error);
    }
  };

  const signInWithRedirect = (): void => {
    setIsLoading(true);
    setError(null);
    facebookAuthService.signInWithRedirect();
  };

  return {
    signInWithFacebook,
    handleFacebookError,
    signInWithRedirect,
    error,
    isLoading,
  };
};