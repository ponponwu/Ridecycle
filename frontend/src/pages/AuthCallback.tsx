
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { hash } = window.location;
    if (hash) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate('/');
        } else {
          navigate('/login');
        }
      });
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Processing login...</h1>
        <p>You'll be redirected automatically.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
