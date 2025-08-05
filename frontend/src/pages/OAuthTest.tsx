import { useState, useRef, useEffect } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useFacebookAuth } from '@/hooks/useFacebookAuth';
import { getOAuthConfig, validateOAuthConfig } from '@/utils/oauthConfig';
import { testOAuthPortConfiguration, logOAuthPortConfiguration } from '@/utils/oauthPortTest';
import { OAuthForm } from '@/components/auth/OAuthForm';
import FacebookSDKStatus from '@/components/debug/FacebookSDKStatus';
import CSPDiagnostic from '@/components/debug/CSPDiagnostic';
import { runCSPTests } from '@/utils/cspTestTool';

const OAuthTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [cspTestResults, setCspTestResults] = useState<Array<{test: string; passed: boolean; error?: string; details?: string}>>([]);
  const googleFormRef = useRef<HTMLFormElement>(null);
  const facebookFormRef = useRef<HTMLFormElement>(null);
  const { signInWithGoogle, signInWithRedirect, isGoogleReady, isLoading: isGoogleLoading } = useGoogleAuth();
  const { signInWithFacebook, signInWithRedirect: facebookRedirect, error: facebookError, isLoading: isFacebookLoading } = useFacebookAuth();

  // 監聽 OAuth 重定向事件
  useEffect(() => {
    const handleGoogleRedirect = () => {
      addTestResult('Triggering Google OAuth POST form...');
      if (googleFormRef.current) {
        googleFormRef.current.submit();
      }
    };

    const handleFacebookRedirect = () => {
      addTestResult('Triggering Facebook OAuth POST form...');
      if (facebookFormRef.current) {
        facebookFormRef.current.submit();
      }
    };

    window.addEventListener('googleOAuthRedirect', handleGoogleRedirect);
    window.addEventListener('facebookOAuthRedirect', handleFacebookRedirect);

    return () => {
      window.removeEventListener('googleOAuthRedirect', handleGoogleRedirect);
      window.removeEventListener('facebookOAuthRedirect', handleFacebookRedirect);
    };
  }, []);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testGoogleOAuth = async () => {
    addTestResult('Testing Google OAuth...');
    try {
      if (isGoogleReady) {
        addTestResult('Google OAuth is ready, attempting sign in...');
        await signInWithGoogle();
      } else {
        addTestResult('Google OAuth not ready, using redirect fallback...');
        signInWithRedirect();
      }
    } catch (error) {
      addTestResult(`Google OAuth error: ${error}`);
    }
  };

  const testFacebookOAuth = async () => {
    addTestResult('Testing Facebook OAuth...');
    try {
      addTestResult('Attempting Facebook login with native SDK...');
      await signInWithFacebook();
    } catch (error) {
      addTestResult(`Facebook OAuth error: ${error}`);
      addTestResult('Falling back to redirect method...');
      facebookRedirect();
    }
  };

  const config = getOAuthConfig();
  const validation = validateOAuthConfig();
  const portTestResults = testOAuthPortConfiguration();

  // 在組件載入時運行端口配置測試和 CSP 測試
  useEffect(() => {
    logOAuthPortConfiguration();
    
    // 運行 CSP 測試
    const runCSPTestsAsync = async () => {
      try {
        const results = await runCSPTests();
        setCspTestResults(results);
      } catch (error) {
        console.error('Failed to run CSP tests:', error);
      }
    };
    
    runCSPTestsAsync();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">OAuth Login Test Page</h1>
      
      {/* Configuration Status */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">配置狀態</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Google OAuth</h3>
            <p className="text-sm text-gray-600">Client ID: {config.googleClientId ? '✓ 已配置' : '✗ 未配置'}</p>
            <p className="text-sm text-gray-600">狀態: {isGoogleReady ? '✓ 已就緒' : '⏳ 載入中'}</p>
          </div>
          <div>
            <h3 className="font-medium">Facebook OAuth</h3>
            <p className="text-sm text-gray-600">App ID: {config.facebookAppId ? '✓ 已配置' : '✗ 未配置'}</p>
            <p className="text-sm text-gray-600">使用原生 Facebook SDK</p>
          </div>
        </div>
        
        {!validation.isValid && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 font-medium">配置問題:</p>
            <ul className="text-red-700 text-sm mt-1">
              {validation.missingKeys.map(key => (
                <li key={key}>• 缺少環境變數: {key}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 端口配置測試結果 */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800 font-medium">端口配置測試:</p>
          <ul className="text-blue-700 text-sm mt-1">
            {portTestResults.map((result, index) => (
              <li key={index} className={result.isCorrect ? 'text-green-700' : 'text-red-700'}>
                {result.isCorrect ? '✅' : '❌'} {result.component}
                {result.error && <span className="ml-2 text-red-600">({result.error})</span>}
              </li>
            ))}
          </ul>
        </div>
        
        {/* CSP 測試結果 */}
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
          <p className="text-purple-800 font-medium">CSP 配置測試:</p>
          {cspTestResults.length > 0 ? (
            <ul className="text-purple-700 text-sm mt-1">
              {cspTestResults.map((result, index) => (
                <li key={index} className={result.passed ? 'text-green-700' : 'text-red-700'}>
                  {result.passed ? '✅' : '❌'} {result.test}
                  {result.details && <span className="ml-2 text-gray-600">({result.details})</span>}
                  {result.error && <span className="ml-2 text-red-600">Error: {result.error}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-purple-700 text-sm mt-1">正在運行 CSP 測試...</p>
          )}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={testGoogleOAuth}
            disabled={isGoogleLoading}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.255H17.92C17.665 15.63 16.89 16.795 15.725 17.525V20.335H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22 19.28 20.335L15.725 17.525C14.74 18.165 13.48 18.55 12 18.55C9.13501 18.55 6.70001 16.64 5.81501 14H2.17501V16.895C3.98001 20.555 7.70001 23 12 23Z" fill="#34A853"/>
              <path d="M5.81496 14C5.59996 13.35 5.47496 12.66 5.47496 11.95C5.47496 11.24 5.59996 10.55 5.81496 9.9V7.005H2.17496C1.42996 8.785 0.999961 10.805 0.999961 12.95C0.999961 15.095 1.42996 17.115 2.17496 18.895L5.81496 16V14Z" fill="#FBBC05"/>
              <path d="M12 5.39998C13.62 5.39998 15.06 5.97498 16.21 7.07998L19.36 3.92998C17.455 2.14998 14.965 0.999976 12 0.999976C7.70001 0.999976 3.98001 3.44498 2.17501 7.10498L5.81501 9.99998C6.70001 7.35998 9.13501 5.39998 12 5.39998Z" fill="#EA4335"/>
            </svg>
            {isGoogleLoading ? 'Processing...' : 'Test Google Login'}
          </button>

          <button
            onClick={testFacebookOAuth}
            disabled={isFacebookLoading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.0733C24 5.40546 18.6274 0 12 0C5.37262 0 0 5.40546 0 12.0733C0 18.0995 4.38823 23.0943 10.125 24V15.5633H7.07694V12.0733H10.125V9.41343C10.125 6.38755 11.9165 4.71615 14.6576 4.71615C15.9705 4.71615 17.3438 4.95195 17.3438 4.95195V7.92313H15.8306C14.3399 7.92313 13.875 8.85384 13.875 9.80855V12.0733H17.2031L16.6711 15.5633H13.875V24C19.6118 23.0943 24 18.0995 24 12.0733Z" />
            </svg>
            {isFacebookLoading ? 'Processing...' : 'Test Facebook Login (Native SDK)'}
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">測試結果</h2>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-60 overflow-y-auto">
          {testResults.length === 0 ? (
            <p>點擊上方按鈕開始測試...</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index}>{result}</div>
            ))
          )}
        </div>
        <button
          onClick={() => setTestResults([])}
          className="mt-2 text-sm text-gray-600 hover:text-gray-800"
        >
          清除結果
        </button>
      </div>

      {/* Error Display */}
      {facebookError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800 font-medium">Facebook Error:</p>
          <p className="text-red-700 text-sm">{facebookError}</p>
        </div>
      )}

      {/* CSP 診斷和修復 */}
      <CSPDiagnostic className="mb-6" />

      {/* Facebook SDK 詳細狀態 */}
      <FacebookSDKStatus className="mb-6" />

      {/* Back to Home */}
      <div className="mt-6 text-center">
        <a href="/" className="text-blue-500 hover:text-blue-700">← 回到首頁</a>
      </div>

      {/* 隱藏的 OAuth POST 表單 */}
      <OAuthForm 
        ref={googleFormRef}
        provider="google_oauth2" 
        style={{ display: 'none' }} 
      />

      <OAuthForm 
        ref={facebookFormRef}
        provider="facebook" 
        style={{ display: 'none' }} 
      />
    </div>
  );
};

export default OAuthTest;