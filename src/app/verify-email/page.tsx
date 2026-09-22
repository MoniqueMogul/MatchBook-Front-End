'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';

import AuthLayout from '@/components/common/AuthLayout';
import { OtpInput } from '@/components/common/otpInput';
import { PasswordInput } from '@/components/common/PasswordInput';
import { Button } from '@/components/common/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

const schema = yup.object().shape({
  password: yup
    .string()
    .min(8, 'Must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

type VerifyFormValues = yup.InferType<typeof schema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { email, setStep } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormValues>({
    resolver: yupResolver(schema),
  });

  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState(27);
  const [resending, setResending] = useState(false);

  /* ------------------------------
     Resend countdown timer
     ------------------------------ */
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  /* ------------------------------
     Step 1 — Verify OTP
     ------------------------------ */
  const handleVerifyOtp = async () => {
    if (otp.length !== 8) {
      setErrorMessage('Please enter the full 8-digit code.');
      return;
    }

    setVerifying(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setOtpVerified(true);
    } catch (err) {
      setErrorMessage('Could not verify the code. Please try again.');
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  /* ------------------------------
     Step 2 — Set password + continue
     ------------------------------ */
  const onSubmit = async (data: VerifyFormValues) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setStep(2);
      router.push('/role-selection');
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------
     Resend OTP
     ------------------------------ */
  const handleResend = async () => {
    if (timer > 0 || resending || !email) return;
    setResending(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setTimer(30);
      setOtp('');
      setOtpVerified(false);
    } catch (err) {
      setErrorMessage('Could not resend the code. Please try again.');
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  /* ------------------------------
     Guard: no email in store
     ------------------------------ */
  if (!email) {
    return (
      <AuthLayout progress={10}>
        <h1 className="page-title">Email missing</h1>
        <p className="page-subtitle">
          Please start again from the signup page.
        </p>
        <Button onClick={() => router.push('/signup')}>Go to signup</Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout progress={10}>
      <h1 className="page-title">Verify Your Email</h1>
      <p className="page-subtitle">
        An email with a one-time password has been sent to {email}
      </p>

      <label className="form-label">OTP</label>
      <OtpInput length={8} onChange={setOtp} />

      <p className="resend-text">
        Didn&apos;t receive the OTP?{' '}
        {timer > 0 ? (
          <>Resend in 0:{timer.toString().padStart(2, '0')}</>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {resending ? 'Sending…' : 'Resend'}
          </button>
        )}
      </p>

      {!otpVerified && (
        <>
          {errorMessage && (
            <p className="form-group__error" style={{ marginTop: 8 }}>
              {errorMessage}
            </p>
          )}
          <Button
            type="button"
            onClick={handleVerifyOtp}
            disabled={verifying || otp.length !== 8}
            style={{ marginTop: '16px', width: '100%' }}
          >
            {verifying ? 'Verifying…' : 'Verify OTP'}
          </Button>
        </>
      )}

      {otpVerified && (
        <>
          <div className="divider" />
          <h3 className="section-title">Set up Your Password</h3>

          <form onSubmit={handleSubmit(onSubmit)}>
            <PasswordInput
              label="Password"
              placeholder="Placeholder text"
              {...register('password')}
              error={errors.password?.message}
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Placeholder text"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            {errorMessage && (
              <p className="form-group__error" style={{ marginTop: 8 }}>
                {errorMessage}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              style={{ marginTop: '20px', width: '100%' }}
            >
              {submitting ? 'Saving…' : 'Verify & Continue'}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}