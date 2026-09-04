import React from 'react';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  progress?: number;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, progress }) => {
  return (
    <div className="auth-layout">
      <div className="auth-layout__left">
        <div className="auth-layout__header">
          {/* Replace this h2 with your actual logo image: <img src="/logo.png" alt="MatchBook" /> */}
          <h2 className="auth-layout__logo-text">matchbook</h2>
          
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
        <div className="auth-layout__image-placeholder">Image</div>
      </div>
    </div>
  );
};

export default AuthLayout;