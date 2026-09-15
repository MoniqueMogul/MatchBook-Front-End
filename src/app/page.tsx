'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/common/AuthLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

type SignupFormData = yup.InferType<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const setEmail = useAuthStore((state) => state.setEmail);

  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: SignupFormData) => {
    const email = data.email.trim().toLowerCase();

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        setSubmitError(error.message);
        return;
      }

      setEmail(email);
      router.push('/verify-email');
    } catch (error) {
      console.error('Failed to send OTP:', error);
      setSubmitError(
        'Unable to send the verification code. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="page-title">Each seller deserves a great exit</h1>

      <p className="page-subtitle">
        This is helper copy that will make them sign up on matchbook
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="inline-form">
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Get Started'}
        </Button>
      </form>

      {submitError && (
        <p
          role="alert"
          style={{
            marginTop: '12px',
            color: '#b42318',
          }}
        >
          {submitError}
        </p>
      )}

      <p className="login-link">
        Already have an account? <a href="/login">Sign In</a>
      </p>
    </AuthLayout>
  );
}