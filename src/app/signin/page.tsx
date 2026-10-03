'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';

import AuthLayout from '@/components/common/AuthLayout';
import { Input } from '@/components/common/Input';
import { PasswordInput } from '@/components/common/PasswordInput';
import { getPostSignInPath } from '@/lib/auth/postSignIn';
import { Button } from '@/components/common/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
});

type SigninFormValues = yup.InferType<typeof schema>;

export default function SigninPage() {
  const router = useRouter();
  const { setEmail } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormValues>({
    resolver: yupResolver(schema),
  });

  const [method, setMethod] = useState<'otp' | 'password'>('otp');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (data: SigninFormValues) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (method === 'password') {
        const { error } = await supabase.auth.signInWithPassword({ email: data.email, password });
        if (error) { setErrorMessage(error.message); return; }
        setEmail(data.email);
        setPassword('');
        router.replace(await getPostSignInPath());
        return;
      }
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        // Supabase returns the same "success" response for existing and
        // non-existing users to prevent email enumeration, so an error here
        // means a real problem such as rate limiting, invalid email format,
        // or a network error.
        setErrorMessage(error.message);
        return;
      }

      setEmail(data.email);
      router.push('/verify-email');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout variant="brand">
      <h1 className="page-title">Welcome back</h1>

      <p className="page-subtitle">
        {method === 'otp' ? "Enter your email and we'll send you a one-time password." : 'Enter your email and password.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />

        {method === 'password' && (
          <PasswordInput label="Password" aria-label="Password" autoComplete="current-password"
            required value={password} onChange={(event) => setPassword(event.target.value)} />
        )}

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
          {submitting ? (method === 'otp' ? 'Sending…' : 'Signing in…') : (method === 'otp' ? 'Continue' : 'Sign in')}
        </Button>
      </form>

      <Button type="button" variant="secondary" disabled={submitting}
        style={{ marginTop: 16, width: '100%' }} onClick={() => {
          setMethod(method === 'otp' ? 'password' : 'otp');
          setPassword('');
          setErrorMessage(null);
        }}>
        {method === 'otp' ? 'Use a password instead' : 'Use an email code instead'}
      </Button>
      <p className="resend-text">To set or reset a password, sign in with an email code and open Account.</p>

      <p className="resend-text" style={{ marginTop: 16 }}>
        Don&apos;t have an account? <a href="/signup">Sign up</a>
      </p>
    </AuthLayout>
  );
}