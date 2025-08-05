/**
 * Facebook SDK TypeScript 定義
 * 為原生 Facebook JavaScript SDK 提供完整的型別支援
 */

declare global {
  interface Window {
    FB: typeof FB;
    fbAsyncInit: () => void;
  }
}

declare namespace FB {
  interface InitParams {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
    autoLogAppEvents?: boolean;
  }

  interface LoginResponse {
    status: 'connected' | 'not_authorized' | 'unknown';
    authResponse?: {
      accessToken: string;
      userID: string;
      expiresIn: number;
      signedRequest: string;
      graphDomain: string;
    };
  }

  interface LoginOptions {
    scope?: string;
    return_scopes?: boolean;
    auth_type?: string;
  }

  interface APIResponse {
    id?: string;
    name?: string;
    email?: string;
    picture?: {
      data: {
        url: string;
        width?: number;
        height?: number;
      };
    };
    error?: {
      message: string;
      type: string;
      code: number;
    };
  }

  type LoginCallback = (response: LoginResponse) => void;
  type APICallback = (response: APIResponse) => void;

  // Facebook SDK 主要方法
  function init(params: InitParams): void;
  function login(callback: LoginCallback, options?: LoginOptions): void;
  function logout(callback?: () => void): void;
  function getLoginStatus(callback: LoginCallback): void;
  
  // Graph API 方法
  function api(path: string, callback: APICallback): void;
  function api(path: string, method: string, callback: APICallback): void;
  function api(path: string, method: string, params: any, callback: APICallback): void;
  
  // 其他實用方法
  function getAccessToken(): string | null;
  function getAuthResponse(): LoginResponse['authResponse'] | null;
  function getVersion(): string;

  // App Events
  namespace AppEvents {
    function logEvent(eventName: string, valueToSum?: number, parameters?: any): void;
  }
}

// Facebook 用戶資訊介面
export interface FacebookUser {
  id: string;
  email?: string;
  name?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

// Facebook 認證回應介面
export interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  expiresIn: number;
  signedRequest: string;
  graphDomain: string;
}

// Facebook 登入錯誤介面
export interface FacebookLoginError {
  type: string;
  message: string;
  code?: number;
}