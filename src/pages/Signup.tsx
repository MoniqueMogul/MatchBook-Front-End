import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/authStore';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const Signup: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
  const navigate = useNavigate();
  const setEmail = useAuthStore((state) => state.setEmail);

  const onSubmit = (data: any) => {
    console.log("Email:", data.email); // Replace with actual API call later
    setEmail(data.email);
    navigate('/verify-email');
  };

  return (
    <AuthLayout>
      <h1 className="page-title">Each seller deserves a great exit</h1>
      <p className="page-subtitle">This is helper copy that will make them sign up on matchbook</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="inline-form">
        <Input label="Email" placeholder="Placeholder text" {...register('email')} error={errors.email?.message} />
        <Button type="submit">Get Started</Button>
      </form>

      <p className="login-link">Already have an account? <a href="/login">Sign In</a></p>
    </AuthLayout>
  );
};

export default Signup;