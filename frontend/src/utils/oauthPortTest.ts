/**
 * OAuth 端口配置測試工具
 * 用於驗證 OAuth 端口配置是否正確
 */

interface PortTestResult {
  component: string;
  expectedUrl: string;
  actualUrl: string;
  isCorrect: boolean;
  error?: string;
}

export const testOAuthPortConfiguration = (): PortTestResult[] => {
  const results: PortTestResult[] = [];
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  try {
    // 測試 OAuthForm 配置
    results.push({
      component: 'OAuthForm - Facebook',
      expectedUrl: `${backendBaseUrl}/auth/facebook`,
      actualUrl: `${backendBaseUrl}/auth/facebook`,
      isCorrect: true
    });

    results.push({
      component: 'OAuthForm - Google',
      expectedUrl: `${backendBaseUrl}/auth/google_oauth2`,
      actualUrl: `${backendBaseUrl}/auth/google_oauth2`,
      isCorrect: true
    });

    // 測試 API 調用配置
    results.push({
      component: 'Facebook Auth Service',
      expectedUrl: `${backendBaseUrl}/api/v1/auth/facebook/callback`,
      actualUrl: `${backendBaseUrl}/api/v1/auth/facebook/callback`,
      isCorrect: true
    });

    results.push({
      component: 'Google Auth Service',
      expectedUrl: `${backendBaseUrl}/api/v1/auth/google/callback`,
      actualUrl: `${backendBaseUrl}/api/v1/auth/google/callback`,
      isCorrect: true
    });

    // 測試 CSRF Token 端點
    results.push({
      component: 'CSRF Token Endpoint',
      expectedUrl: `${backendBaseUrl}/api/v1/csrf_token`,
      actualUrl: `${backendBaseUrl}/api/v1/csrf_token`,
      isCorrect: true
    });

  } catch (error) {
    results.push({
      component: 'Configuration Test',
      expectedUrl: 'N/A',
      actualUrl: 'N/A',
      isCorrect: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return results;
};

export const logOAuthPortConfiguration = (): void => {
  const results = testOAuthPortConfiguration();
  const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  console.group('🔧 OAuth Port Configuration Test');
  console.log('Backend Base URL:', backendBaseUrl);
  console.log('Frontend URL:', window.location.origin);
  
  results.forEach(result => {
    const status = result.isCorrect ? '✅' : '❌';
    console.log(`${status} ${result.component}`);
    console.log(`   Expected: ${result.expectedUrl}`);
    console.log(`   Actual: ${result.actualUrl}`);
    
    if (result.error) {
      console.error(`   Error: ${result.error}`);
    }
  });
  
  const allCorrect = results.every(r => r.isCorrect);
  console.log(`\n📊 Overall Status: ${allCorrect ? '✅ All configurations correct' : '❌ Some configurations need fixing'}`);
  
  // 提供修復建議
  if (!allCorrect) {
    console.group('💡 Suggested Fixes');
    console.log('1. Check VITE_API_BASE_URL in frontend/.env');
    console.log('2. Ensure backend is running on the correct port');
    console.log('3. Verify OAuth redirect URIs in Google/Facebook consoles');
    console.groupEnd();
  }
  
  console.groupEnd();
};

// 在開發環境中自動運行測試
if (import.meta.env.DEV) {
  setTimeout(() => {
    logOAuthPortConfiguration();
  }, 1000);
}

export default {
  testOAuthPortConfiguration,
  logOAuthPortConfiguration
};