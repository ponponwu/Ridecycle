import { useState, useEffect } from 'react';
import { checkFacebookSDKStatus } from '@/utils/facebookSDKChecker';

interface FacebookSDKStatusProps {
  className?: string;
}

export const FacebookSDKStatus = ({ className = '' }: FacebookSDKStatusProps) => {
  const [sdkStatus, setSdkStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const status = await checkFacebookSDKStatus();
      setSdkStatus(status);
    } catch (error) {
      console.error('Failed to check Facebook SDK status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleRetry = async () => {
    await checkStatus();
  };

  if (isLoading) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-sm text-gray-600">正在檢查 Facebook SDK 狀態...</p>
      </div>
    );
  }

  if (!sdkStatus) {
    return (
      <div className={`p-4 bg-red-50 rounded-lg ${className}`}>
        <p className="text-sm text-red-600">無法檢查 Facebook SDK 狀態</p>
      </div>
    );
  }

  const getStatusColor = (value: boolean) => value ? 'text-green-600' : 'text-red-600';
  const getStatusIcon = (value: boolean) => value ? '✅' : '❌';

  return (
    <div className={`p-4 bg-white border rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Facebook SDK 詳細狀態</h3>
        <button
          onClick={handleRetry}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          重新檢查
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <p className={getStatusColor(sdkStatus.isSDKLoaded)}>
            {getStatusIcon(sdkStatus.isSDKLoaded)} SDK 已載入
          </p>
          <p className={getStatusColor(sdkStatus.isSDKInitialized)}>
            {getStatusIcon(sdkStatus.isSDKInitialized)} SDK 已初始化
          </p>
          <p className={getStatusColor(sdkStatus.scriptTagExists)}>
            {getStatusIcon(sdkStatus.scriptTagExists)} 腳本標籤存在
          </p>
          <p className={getStatusColor(!sdkStatus.hasError)}>
            {getStatusIcon(!sdkStatus.hasError)} 無錯誤
          </p>
        </div>
        
        <div className="space-y-1">
          <p className="text-gray-600">
            <span className="font-medium">就緒狀態:</span> {sdkStatus.sdkReadyState}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">App ID:</span> {sdkStatus.appId ? '已配置' : '未配置'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">SDK 版本:</span> {sdkStatus.sdkVersion || '未知'}
          </p>
          {sdkStatus.errorMessage && (
            <p className="text-red-600">
              <span className="font-medium">錯誤:</span> {sdkStatus.errorMessage}
            </p>
          )}
        </div>
      </div>
      
      {/* 診斷建議 */}
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p className="text-sm font-medium text-blue-800 mb-2">診斷建議:</p>
        <ul className="text-sm text-blue-700 space-y-1">
          {!sdkStatus.scriptTagExists && (
            <li>• @greatsumini/react-facebook-login 套件應該會自動載入 SDK</li>
          )}
          {sdkStatus.scriptTagExists && !sdkStatus.isSDKLoaded && (
            <li>• 檢查 CSP 配置是否允許 connect.facebook.net</li>
          )}
          {sdkStatus.sdkReadyState === 'loading' && (
            <li>• SDK 正在載入中，請稍候片刻</li>
          )}
          {!sdkStatus.appId && (
            <li>• 檢查 VITE_FACEBOOK_APP_ID 環境變數</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FacebookSDKStatus;