import { GoogleOAuthProvider as ReactGoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

interface GoogleOAuthProviderProps {
  children: ReactNode;
}

export const GoogleOAuthProvider = ({ children }: GoogleOAuthProviderProps) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  if (!clientId) {
    console.warn('Google Client ID not found in environment variables');
    return <>{children}</>;
  }

  return (
    <ReactGoogleOAuthProvider clientId={clientId}>
      {children}
    </ReactGoogleOAuthProvider>
  );
};