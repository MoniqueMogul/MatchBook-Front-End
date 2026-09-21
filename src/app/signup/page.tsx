'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';

import AuthLayout from '@/components/common/AuthLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const schema = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .required('First name is required')
    .min(1, 'First name is required'),
  lastName: yup
    .string()
    .trim()
    .required('Last name is required')
    .min(1, 'Last name is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
});

type SignupFormValues = yup.InferType<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const { setEmail, setStep } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: yupResolver(schema),
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: SignupFormValues) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: true,
          data: {
            first_name: data.firstName.trim(),
            last_name: data.lastName.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setEmail(data.email);
      setStep(1);
      router.push('/verify-email');
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout progress={5}>
      <h1 className="page-title">Create your account</h1>
      <p className="page-subtitle">
        Enter your details and we&apos;ll send you a one-time password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="First Name"
          type="text"
          placeholder="Jane"
          autoComplete="given-name"
          {...register('firstName')}
          error={errors.firstName?.message}
        />

        <Input
          label="Last Name"
          type="text"
          placeholder="Doe"
          autoComplete="family-name"
          {...register('lastName')}
          error={errors.lastName?.message}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />

        {errorMessage && (
          <p className="form-group__error" style={{ marginTop: 12 }}>
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          style={{ marginTop: '20px', width: '100%' }}
        >
          {submitting ? 'Sending…' : 'Continue'}
        </Button>
      </form>

      <p className="resend-text" style={{ marginTop: 16 }}>
        Already have an account? <a href="/verify-email">Sign in</a>
      </p>
    </AuthLayout>
  );
}