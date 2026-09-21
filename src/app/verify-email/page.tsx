'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/common/AuthLayout';
import { OtpInput } from '@/components/common/OtpInput';
import { PasswordInput } from '@/components/common/PasswordInput';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

const schema = yup.object().shape({
  password: yup.string().min(8, 'Must be at least 8 chars').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm Password is required'),
});

export default function VerifyEmailPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
  const router = useRouter();
  const { email, setStep } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(27);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!email) {
      router.replace('/');
    }
  }, [email, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    if (otp.length !== 6) {
      setOtpError('Please enter the 6-digit code.');
      return;
    }

    setOtpError('');
    setIsVerifying(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (verifyError) {
        setOtpError(verifyError.message);
        return;
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (passwordError) {
        setOtpError(passwordError.message);
        return;
      }

      setStep(2);
      router.push('/role-selection');
    } catch {
      setOtpError('Unable to verify the code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;

    setOtpError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      setOtpError(error.message);
      return;
    }

    setTimer(27);
  };

  return (
    <AuthLayout progress={10}>
      <h1 className="page-title">Verify Your Email</h1>
      <p className="page-subtitle">An email with a one-time password has been sent to {email}</p>

      <label className="form-label">OTP</label>
      <OtpInput onChange={setOtp} />

      {otpError && (
        <p role="alert" style={{ color: '#b42318', fontSize: '13px', marginTop: '8px' }}>
          {otpError}
        </p>
      )}

      <p className="resend-text">
        Did not receive OTP?{' '}
        {timer > 0 ? (
          <>Resend in 0:{timer.toString().padStart(2, '0')}</>
        ) : (
          <a href="#" onClick={(event) => { event.preventDefault(); handleResend(); }}>Resend</a>
        )}
      </p>

      <div className="divider"></div>
      <h3 className="section-title">Set up Your Password</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <PasswordInput label="Password" placeholder="Placeholder text" {...register('password')} error={errors.password?.message} />
        <PasswordInput label="Confirm Password" placeholder="Placeholder text" {...register('confirmPassword')} error={errors.confirmPassword?.message} />

        <Button type="submit" disabled={isVerifying} style={{ marginTop: '20px' }}>
          {isVerifying ? 'Verifying...' : 'Verify & Continue'}
        </Button>
      </form>
    </AuthLayout>
  );
}