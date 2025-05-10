
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AuthForm from '@/components/auth/AuthForm';

const Register = () => {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-16">
        <AuthForm type="register" />
      </div>
    </MainLayout>
  );
};

export default Register;
