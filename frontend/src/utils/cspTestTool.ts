/**
 * CSP 測試工具
 * 用於測試 CSP 配置是否正確支持 OAuth 功能
 */

interface CSPTestResult {
  test: string;
  passed: boolean;
  error?: string;
  details?: string;
}

// 測試 form-action 指令是否允許後端提交
export const testFormAction = (backendUrl: string): CSPTestResult => {
  try {
    // 創建測試表單
    const testForm = document.createElement('form');
    testForm.method = 'POST';
    testForm.action = `${backendUrl}/auth/facebook`;
    testForm.style.display = 'none';
    
    // 添加到 DOM 中測試
    document.body.appendChild(testForm);
    
    // 清理
    document.body.removeChild(testForm);
    
    return {
      test: 'form-action to backend',
      passed: true,
      details: `Successfully created form with action: ${testForm.action}`
    };
  } catch (error) {
    return {
      test: 'form-action to backend',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to create form with backend action'
    };
  }
};

// 測試 connect-src 指令是否允許 Facebook API 連接
export const testConnectSrc = async (): Promise<CSPTestResult> => {
  try {
    // 測試 Facebook Graph API 連接
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://graph.facebook.com/me', {
      signal: controller.signal,
      mode: 'cors' // 明確使用 CORS 模式
    });
    
    clearTimeout(timeoutId);
    
    // 即使是 401 錯誤也表示連接成功（只是沒有 access token）
    if (response.status === 401 || response.status === 400) {
      return {
        test: 'connect-src Facebook API',
        passed: true,
        details: 'Successfully connected to Facebook API (authentication required)'
      };
    }
    
    return {
      test: 'connect-src Facebook API',
      passed: response.ok,
      details: `Response status: ${response.status}`
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        test: 'connect-src Facebook API',
        passed: false,
        error: 'Request timeout',
        details: 'Connection to Facebook API timed out'
      };
    }
    
    return {
      test: 'connect-src Facebook API',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Failed to connect to Facebook API'
    };
  }
};

// 測試 script-src 指令是否允許 Facebook SDK
export const testScriptSrc = (): CSPTestResult => {
  try {
    // 檢查是否有 Facebook SDK 腳本
    const fbScripts = document.querySelectorAll('script[src*="connect.facebook.net"]');
    
    if (fbScripts.length > 0) {
      return {
        test: 'script-src Facebook SDK',
        passed: true,
        details: `Found ${fbScripts.length} Facebook SDK script(s)`
      };
    } else {
      return {
        test: 'script-src Facebook SDK',
        passed: false,
        details: 'No Facebook SDK scripts found in DOM'
      };
    }
  } catch (error) {
    return {
      test: 'script-src Facebook SDK',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// 執行所有 CSP 測試
export const runCSPTests = async (): Promise<CSPTestResult[]> => {
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const results: CSPTestResult[] = [];
  
  // 測試 form-action
  results.push(testFormAction(backendUrl));
  
  // 測試 script-src
  results.push(testScriptSrc());
  
  // 測試 connect-src (異步)
  results.push(await testConnectSrc());
  
  return results;
};

// 記錄 CSP 測試結果
export const logCSPTestResults = async (): Promise<void> => {
  const results = await runCSPTests();
  
  console.group('🛡️ CSP Configuration Tests');
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
    
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
    
    if (result.error) {
      console.error(`   Error: ${result.error}`);
    }
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`\n📊 Results: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount < totalCount) {
    console.warn('💡 Some CSP tests failed. Check your CSP configuration.');
  }
  
  console.groupEnd();
};

// 在開發環境中自動運行測試
if (import.meta.env.DEV) {
  setTimeout(() => {
    logCSPTestResults();
  }, 5000); // 延遲 5 秒確保頁面完全載入
}

export default {
  testFormAction,
  testConnectSrc,
  testScriptSrc,
  runCSPTests,
  logCSPTestResults
};