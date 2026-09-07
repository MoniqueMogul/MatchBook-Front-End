'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/common/AuthLayout';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import './RoleSelection.css';

import buyerIcon from '@/assets/buyer-icon.png';
import sellerIcon from '@/assets/seller-icon.png';

export default function RoleSelectionPage() {
  const router = useRouter();
  const { setRole, setStep } = useAuthStore();
  const [selected, setSelected] = useState<'buyer' | 'seller' | null>(null);

  const handleNext = () => {
    if (selected) {
      setRole(selected);
      setStep(3);
      console.log("🚀 Role selected:", selected);
      // We don't navigate anywhere yet as the dashboard is not built.
    }
  };

  return (
    <AuthLayout progress={20}>
      <h1 className="page-title">How are you using MatchBook?</h1>
      
      <div className="role-cards">
        <div 
          className={`role-card ${selected === 'buyer' ? 'role-card--selected' : ''}`} 
          onClick={() => setSelected('buyer')}
        >
          <div className="role-card__icon">
            <img src={buyerIcon.src} alt="Buyer Icon" className="role-card__icon-image" />
          </div>
          <h3 className="role-card__title">I'm looking to acquire</h3>
          <p className="role-card__desc">Tell us what you are looking for and get matched with verified, qualified sellers.</p>
        </div>

        <div 
          className={`role-card ${selected === 'seller' ? 'role-card--selected' : ''}`} 
          onClick={() => setSelected('seller')}
        >
          <div className="role-card__icon">
            <img src={sellerIcon.src} alt="Seller Icon" className="role-card__icon-image" />
          </div>
          <h3 className="role-card__title">I'm selling my business</h3>
          <p className="role-card__desc">List your business and meet buyers who are financially qualified and the right operational fit.</p>
        </div>
      </div>

      <div className="role-actions">
        <Button variant="secondary" onClick={() => router.back()}>Back</Button>
        <Button variant="primary" onClick={handleNext} disabled={!selected}>Next</Button>
      </div>
    </AuthLayout>
  );
}