import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { checkFacebookSDKStatus, logFacebookSDKStatus, waitForFacebookSDKWithRetry } from '@/utils/facebookSDKChecker';

interface FacebookOAuthProviderProps {
  children: ReactNode;
}

interface FacebookContextType {
  appId: string;
  isConfigured: boolean;
  isSDKReady: boolean;
  sdkError: string | null;
  retrySDKCheck: () => void;
}

const FacebookContext = createContext<FacebookContextType>({
  appId: '',
  isConfigured: false,
  isSDKReady: false,
  sdkError: null,
  retrySDKCheck: () => {}
});

export const useFacebookContext = () => useContext(FacebookContext);

export const FacebookOAuthProvider = ({ children }: FacebookOAuthProviderProps) => {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID || '';
  const isConfigured = !!appId && appId !== 'your_facebook_app_id_here';
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      console.warn('Facebook App ID not configured. Facebook login will use redirect fallback.');
      return;
    }

    // 檢查 Facebook SDK 狀態
    const checkSDKStatus = async () => {
      try {
        // 首先嘗試智能等待 SDK 載入
        const sdkLoaded = await waitForFacebookSDKWithRetry(2, 12000); // 2次重試，每次12秒
        
        if (sdkLoaded) {
          console.log('✅ Facebook SDK loaded, performing detailed check...');
          const status = await checkFacebookSDKStatus();
          setIsSDKReady(status.isSDKLoaded && status.isSDKInitialized);
          setSdkError(null);
          
          // 在開發環境中記錄詳細狀態
          if (import.meta.env.DEV) {
            logFacebookSDKStatus();
          }
        } else {
          console.warn('❌ Facebook SDK failed to load, checking status anyway...');
          const status = await checkFacebookSDKStatus();
          setIsSDKReady(false);
          
          // 根據 SDK 狀態提供更準確的錯誤訊息
          switch (status.sdkReadyState) {
            case 'loading':
              setSdkError('Facebook SDK is taking longer than expected to load. Will use redirect fallback.');
              break;
            case 'error':
              if (!status.scriptTagExists) {
                setSdkError('Facebook SDK script not found. Will use redirect fallback.');
              } else {
                setSdkError('Facebook SDK failed to load. Check CSP configuration. Will use redirect fallback.');
              }
              break;
            default:
              setSdkError('Facebook SDK not ready. Will use redirect fallback.');
          }
          
          // 在開發環境中記錄詳細狀態
          if (import.meta.env.DEV) {
            logFacebookSDKStatus();
          }
        }
      } catch (error) {
        console.error('Failed to check Facebook SDK status:', error);
        setSdkError('Failed to check Facebook SDK status');
        setIsSDKReady(false);
      }
    };

    // 延遲檢查，讓 SDK 有時間載入
    const timeoutId = setTimeout(checkSDKStatus, 3000);
    
    // 額外的重試機制：如果初次檢查失敗，再次嘗試
    const retryTimeoutId = setTimeout(() => {
      if (!isSDKReady) {
        console.log('🔄 Retrying Facebook SDK check due to initial failure...');
        checkSDKStatus();
      }
    }, 8000); // 8秒後重試
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(retryTimeoutId);
    };
  }, [isConfigured]);

  // 重試 SDK 檢查
  const retrySDKCheck = async () => {
    console.log('🔄 Retrying Facebook SDK check...');
    setSdkError(null);
    
    const status = await checkFacebookSDKStatus();
    setIsSDKReady(status.isSDKLoaded && status.isSDKInitialized);
    
    if (status.hasError) {
      setSdkError(status.errorMessage || 'Unknown SDK error');
    } else if (!status.isSDKLoaded) {
      switch (status.sdkReadyState) {
        case 'loading':
          setSdkError('Facebook SDK is still loading. Please wait a moment.');
          break;
        case 'error':
          if (!status.scriptTagExists) {
            setSdkError('Facebook SDK script not found. Will use redirect fallback.');
          } else {
            setSdkError('Facebook SDK failed to load. Check CSP configuration.');
          }
          break;
        default:
          setSdkError('Facebook SDK not ready. Will use redirect fallback.');
      }
    } else {
      setSdkError(null);
    }
  };

  const contextValue: FacebookContextType = {
    appId,
    isConfigured,
    isSDKReady,
    sdkError,
    retrySDKCheck
  };

  return (
    <FacebookContext.Provider value={contextValue}>
      {children}
    </FacebookContext.Provider>
  );
};