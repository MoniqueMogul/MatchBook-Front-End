import React from 'react';
import './AuthLayout.css';
import heroImage from '../assets/hero.png';

interface AuthLayoutProps {
  children: React.ReactNode;
  progress?: number;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, progress }) => {
  return (
    <div className="auth-layout">
      <div className="auth-layout__left">
        <div className="auth-layout__header">
          {/* Logo Image */}
          <img src="/logo.png" alt="MatchBook" className="auth-layout__logo" />
          
          {/* Progress Bar */}
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
        <img src={heroImage} alt="MatchBook Background" className="auth-layout__background-image" />
      </div>
    </div>
  );
};

export default AuthLayout;