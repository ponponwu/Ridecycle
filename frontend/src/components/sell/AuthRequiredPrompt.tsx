
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AuthRequiredPrompt = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center p-8 rounded-lg border border-gray-200 bg-white shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
      <p className="text-gray-600 mb-6">You need to sign in to list a bike for sale.</p>
      <Button onClick={() => navigate('/login')} className="bg-marketplace-blue hover:bg-blue-600">
        Sign In
      </Button>
    </div>
  );
};

export default AuthRequiredPrompt;
