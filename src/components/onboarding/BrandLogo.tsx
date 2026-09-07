import React from 'react';
import './OnboardingComponents.css';

export const BrandLogo: React.FC = () => {
  return (
    <div className="ob-logo">
      <img src="/logo.png" alt="Matchbook" className="ob-logo__img" />
    </div>
  );
};
