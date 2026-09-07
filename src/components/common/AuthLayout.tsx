'use client';

import React from 'react';
import Image from 'next/image'; // CRITICAL: Import Next Image
import './AuthLayout.css';
import heroImage from '../../assets/hero.png';

interface AuthLayoutProps {
  children: React.ReactNode;
  progress?: number;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, progress }) => {
  return (
    <div className="auth-layout">
      <div className="auth-layout__left">
        <div className="auth-layout__header">
          {/* Use Next Image for the logo */}
          <Image src="/logo.png" alt="MatchBook" width={150} height={40} className="auth-layout__logo" />
          
          {progress !== undefined && (
            <div className="auth-layout__progress">
              <div className="auth-layout__progress-bar" style={{ width: `${progress}%` }}></div>
              <span className="auth-layout__progress-text">{progress}%</span>
            </div>
          )}
        </div>
        <div className="auth-layout__content">
          {children}
        </div>
      </div>
      <div className="auth-layout__right">
        {/* CRITICAL: Use fill and sizes for background images */}
        <Image 
          src={heroImage} 
          alt="MatchBook Background" 
          fill 
          sizes="50vw" 
          priority 
          className="auth-layout__background-image" 
        />
      </div>
    </div>
  );
};

export default AuthLayout;