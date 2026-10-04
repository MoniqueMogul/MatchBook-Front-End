'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/common/AuthLayout';
import { Button } from '@/components/common/Button';
import { selectRolePath } from '@/lib/auth/roleRouting';
import { useAuthStore } from '@/store/authStore';
import './RoleSelection.css';

import buyerIcon from '@/assets/buyer-icon.png';
import sellerIcon from '@/assets/seller-icon.png';

export default function RoleSelectionPage() {
  const router = useRouter();
  const { setStep } = useAuthStore();
  const [selected, setSelected] = useState<'buyer' | 'seller' | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const handleNext = async () => {
    if (!selected || submitting.current) return;
    submitting.current = true;
    setSaving(true); setError(null);
    try {
      const destination = await selectRolePath(selected);
      setStep(3);
      router.push(destination);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save your role. Please try again.');
    } finally { submitting.current = false; setSaving(false); }
  };

  return (
    <AuthLayout variant="brand">
      <h1 className="page-title">How are you using MatchBook?</h1>
      
      <div className="role-cards">
        <div 
          className={`role-card ${selected === 'buyer' ? 'role-card--selected' : ''}`} 
          onClick={() => { if (!saving) setSelected('buyer'); }}
        >
          <div className="role-card__icon">
            <img src={buyerIcon.src} alt="Buyer Icon" className="role-card__icon-image" />
          </div>
          <h3 className="role-card__title">I'm looking to acquire</h3>
          <p className="role-card__desc">Tell us what you are looking for and get matched with verified, qualified sellers.</p>
        </div>

        <div 
          className={`role-card ${selected === 'seller' ? 'role-card--selected' : ''}`} 
          onClick={() => { if (!saving) setSelected('seller'); }}
        >
          <div className="role-card__icon">
            <img src={sellerIcon.src} alt="Seller Icon" className="role-card__icon-image" />
          </div>
          <h3 className="role-card__title">I'm selling my business</h3>
          <p className="role-card__desc">List your business and meet buyers who are financially qualified and the right operational fit.</p>
        </div>
      </div>

      {error && <p role="alert">{error}</p>}
      <div className="role-actions">
        <Button variant="secondary" disabled={saving} onClick={() => router.back()}>Back</Button>
        <Button variant="primary" onClick={handleNext} disabled={!selected || saving}>{saving ? 'Saving…' : 'Next'}</Button>
      </div>
    </AuthLayout>
  );
}