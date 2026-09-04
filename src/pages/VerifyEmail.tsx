import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { OtpInput } from '../components/common/OtpInput';
import { PasswordInput } from '../components/common/PasswordInput';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/authStore';

const schema = yup.object().shape({
  password: yup.string().min(8, 'Must be at least 8 chars').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm Password is required'),
});

const VerifyEmail: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
  const navigate = useNavigate();
  const { setStep } = useAuthStore();
  
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(27);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = (data: any) => {
    console.log("OTP:", otp, "Passwords:", data);
    setStep(2); 
    navigate('/role-selection'); 
  };

  return (
    <AuthLayout progress={10}>
      <h1 className="page-title">Verify Your Email</h1>
      <p className="page-subtitle">An email with a one-time password has been sent to email@gmail.com</p>

      <label className="form-label">OTP</label>
      <OtpInput onChange={setOtp} />

      <p className="resend-text">
        Did not receive OTP? <a href="#">Resend</a> in 0:{timer.toString().padStart(2, '0')}
      </p>

      <div className="divider"></div>
      <h3 className="section-title">Set up Your Password</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <PasswordInput label="Password" placeholder="Placeholder text" {...register('password')} error={errors.password?.message} />
        <PasswordInput label="Confirm Password" placeholder="Placeholder text" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
        
        <Button type="submit" style={{ marginTop: '20px' }}>Verify & Continue</Button>
      </form>
    </AuthLayout>
  );
};

export default VerifyEmail;