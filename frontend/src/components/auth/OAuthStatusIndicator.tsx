import { useState, useEffect } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { getOAuthConfig, validateOAuthConfig } from '@/utils/oauthConfig';
import { checkFacebookSDKStatus } from '@/utils/facebookSDKChecker';

interface OAuthStatusIndicatorProps {
  showDetails?: boolean;
}

export const OAuthStatusIndicator = ({ showDetails = false }: OAuthStatusIndicatorProps) => {
  const { isGoogleReady } = useGoogleAuth();
  const [isFacebookLoaded, setIsFacebookLoaded] = useState(false);
  const config = getOAuthConfig();
  const validation = validateOAuthConfig();

  useEffect(() => {
    const checkFacebookStatus = async () => {
      const status = await checkFacebookSDKStatus();
      setIsFacebookLoaded(status.isSDKLoaded && status.isSDKInitialized);
    };
    
    checkFacebookStatus();
  }, []);

  if (!showDetails) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border text-sm space-y-2">
      <h3 className="font-medium text-gray-900">OAuth 服務狀態</h3>
      
      {/* Google 狀態 */}
      <div className="flex items-center justify-between">
        <span>Google OAuth:</span>
        <span className={`px-2 py-1 rounded text-xs ${
          isGoogleReady 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isGoogleReady ? '已就緒' : '載入中'}
        </span>
      </div>

      {/* Facebook 狀態 */}
      <div className="flex items-center justify-between">
        <span>Facebook OAuth:</span>
        <span className={`px-2 py-1 rounded text-xs ${
          isFacebookLoaded 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isFacebookLoaded ? '已就緒' : '載入中'}
        </span>
      </div>

      {/* 配置警告 */}
      {!validation.isValid && (
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <p className="text-red-800 font-medium">配置問題:</p>
          <ul className="text-red-700 text-xs mt-1">
            {validation.missingKeys.map(key => (
              <li key={key}>• 缺少環境變數: {key}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 配置警告 */}
      {validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
          <p className="text-yellow-800 font-medium">配置警告:</p>
          <ul className="text-yellow-700 text-xs mt-1">
            {validation.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};