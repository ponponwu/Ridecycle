
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AuthForm from '@/components/auth/AuthForm';

const Login = () => {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-16">
        <AuthForm type="login" />
      </div>
    </MainLayout>
  );
};

export default Login;
