import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/authStore';
import './RoleSelection.css';

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const setRole = useAuthStore((state) => state.setRole);
  const [selected, setSelected] = useState<'buyer' | 'seller' | null>(null);

  const handleNext = () => {
    if (selected) {
      setRole(selected);
      console.log("Role selected:", selected); // Replace with actual API call
      navigate('/dashboard'); // Or next step
    }
  };

  return (
    <AuthLayout progress={10}>
      <h1 className="page-title">How are you using MatchBook?</h1>
      
      <div className="role-cards">
        <div 
          className={`role-card ${selected === 'buyer' ? 'role-card--selected' : ''}`} 
          onClick={() => setSelected('buyer')}
        >
          <div className="role-card__icon">💼</div>
          <h3 className="role-card__title">I'm looking to acquire</h3>
          <p className="role-card__desc">Tell us what you are looking for and get matched with verified, qualified sellers.</p>
        </div>

        <div 
          className={`role-card ${selected === 'seller' ? 'role-card--selected' : ''}`} 
          onClick={() => setSelected('seller')}
        >
          <div className="role-card__icon">🏢</div>
          <h3 className="role-card__title">I'm selling my business</h3>
          <p className="role-card__desc">List your business and meet buyers who are financially qualified and the right operational fit.</p>
        </div>
      </div>

      <div className="role-actions">
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
        <Button variant="primary" onClick={handleNext} disabled={!selected}>Next</Button>
      </div>
    </AuthLayout>
  );
};

export default RoleSelection;