/**
 * OAuth 配置檢查工具
 */

export interface OAuthConfig {
  googleClientId: string;
  facebookAppId: string;
}

export const getOAuthConfig = (): OAuthConfig => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID || '';

  return {
    googleClientId,
    facebookAppId
  };
};

export const validateOAuthConfig = (): {
  isValid: boolean;
  missingKeys: string[];
  warnings: string[];
} => {
  const config = getOAuthConfig();
  const missingKeys: string[] = [];
  const warnings: string[] = [];

  // 檢查必要的環境變數
  if (!config.googleClientId || config.googleClientId === 'your_google_client_id_here') {
    missingKeys.push('VITE_GOOGLE_CLIENT_ID');
  }

  if (!config.facebookAppId || config.facebookAppId === 'your_facebook_app_id_here') {
    missingKeys.push('VITE_FACEBOOK_APP_ID');
  }

  // 檢查配置格式
  if (config.googleClientId && !config.googleClientId.includes('-')) {
    warnings.push('Google Client ID format seems incorrect');
  }

  if (config.facebookAppId && !/^\d+$/.test(config.facebookAppId)) {
    warnings.push('Facebook App ID should be numeric');
  }

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
    warnings
  };
};

export const logOAuthConfigStatus = (): void => {
  const validation = validateOAuthConfig();
  
  if (!validation.isValid) {
    console.warn('OAuth Configuration Issues:', {
      missingKeys: validation.missingKeys,
      warnings: validation.warnings
    });
  }
  
  if (validation.warnings.length > 0) {
    console.warn('OAuth Configuration Warnings:', validation.warnings);
  }
  
  if (validation.isValid && validation.warnings.length === 0) {
    console.log('OAuth Configuration: All settings are valid');
  }
};