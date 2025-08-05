import { useState, useEffect } from 'react';
import { validateCurrentCSP, forceUpdateCSP, generateDynamicCSP } from '@/utils/dynamicCSP';

interface CSPDiagnosticProps {
  className?: string;
}

export const CSPDiagnostic = ({ className = '' }: CSPDiagnosticProps) => {
  const [cspValidation, setCspValidation] = useState<{isValid: boolean; issues: string[]; currentCSP: string | null} | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const checkCSP = () => {
    const validation = validateCurrentCSP();
    setCspValidation(validation);
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    try {
      forceUpdateCSP();
      // 等待一下讓 CSP 更新生效
      setTimeout(() => {
        checkCSP();
        setIsUpdating(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to update CSP:', error);
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('CSP copied to clipboard');
    });
  };

  useEffect(() => {
    checkCSP();
  }, []);

  return (
    <div className={`p-4 bg-white border rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">CSP 診斷和修復</h3>
        <div className="space-x-2">
          <button
            onClick={checkCSP}
            className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重新檢查
          </button>
          <button
            onClick={handleForceUpdate}
            disabled={isUpdating}
            className="text-xs px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {isUpdating ? '更新中...' : '強制更新 CSP'}
          </button>
        </div>
      </div>

      {cspValidation ? (
        <div className="space-y-4">
          {/* CSP 狀態 */}
          <div className={`p-3 rounded ${cspValidation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-medium ${cspValidation.isValid ? 'text-green-800' : 'text-red-800'}`}>
              {cspValidation.isValid ? '✅ CSP 配置正確' : '❌ CSP 配置有問題'}
            </p>
            {!cspValidation.isValid && cspValidation.issues.length > 0 && (
              <ul className="mt-2 text-sm text-red-700">
                {cspValidation.issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            )}
          </div>

          {/* 當前 CSP */}
          {cspValidation.currentCSP && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700">當前 CSP 配置:</h4>
                <button
                  onClick={() => copyToClipboard(cspValidation.currentCSP || '')}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  複製到剪貼簿
                </button>
              </div>
              <div className="bg-gray-100 p-3 rounded text-xs font-mono break-all max-h-32 overflow-y-auto">
                {cspValidation.currentCSP}
              </div>
            </div>
          )}

          {/* 推薦 CSP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-700">推薦 CSP 配置:</h4>
              <button
                onClick={() => copyToClipboard(generateDynamicCSP())}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                複製到剪貼簿
              </button>
            </div>
            <div className="bg-blue-50 p-3 rounded text-xs font-mono break-all max-h-32 overflow-y-auto">
              {generateDynamicCSP()}
            </div>
          </div>

          {/* 操作說明 */}
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
            <h4 className="font-medium text-yellow-800 mb-2">修復說明:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 如果 CSP 配置有問題，點擊「強制更新 CSP」按鈕</li>
              <li>• 更新後請重新載入頁面以確保 CSP 生效</li>
              <li>• 如果問題仍然存在，檢查環境變數 VITE_API_BASE_URL</li>
              <li>• Facebook SDK 需要 script-src 和 connect-src 支持</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-600">正在檢查 CSP 配置...</p>
        </div>
      )}
    </div>
  );
};

export default CSPDiagnostic;