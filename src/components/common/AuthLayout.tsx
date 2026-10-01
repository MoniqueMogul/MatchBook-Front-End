'use client';

import React from 'react';
import Image from 'next/image';

import './AuthLayout.css';
import heroImage from '../../assets/hero.png';

type AuthLayoutVariant = 'default' | 'brand';

interface AuthLayoutProps {
  children: React.ReactNode;
  progress?: number;
  variant?: AuthLayoutVariant;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  progress,
  variant = 'default',
}) => {
  const showBranding =
    variant === 'brand';

  return (
    <div className="auth-layout">
      <div className="auth-layout__left">
        <div className="auth-layout__header">
          <Image
            src="/logo.png"
            alt="MatchBook"
            width={150}
            height={40}
            className="auth-layout__logo"
          />

          {progress !== undefined && (
            <div className="auth-layout__progress">
              <div
                className="auth-layout__progress-bar"
                style={{ width: `${progress}%` }}
              />
              <span className="auth-layout__progress-text">
                {progress}%
              </span>
            </div>
          )}
        </div>

        <div className="auth-layout__content">
          {children}
        </div>
      </div>

      <div
        className={[
          'auth-layout__right',
          showBranding
            ? 'auth-layout__right--brand'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {showBranding ? (
          <div className="auth-layout__brand-panel">
            <Image
              src="/brand/matchbook-mark.png"
              alt="MatchBook"
              width={180}
              height={180}
              priority
              className="auth-layout__brand-mark"
            />

            <h2 className="auth-layout__brand-heading">
              Every Business Deserves
              <span>a Next Chapter.</span>
            </h2>

            <p className="auth-layout__brand-values">
              Trust
              <span aria-hidden="true">•</span>
              Connection
              <span aria-hidden="true">•</span>
              Fit
              <span aria-hidden="true">•</span>
              Opportunity
            </p>
          </div>
        ) : (
          <Image
            src={heroImage}
            alt="MatchBook Background"
            fill
            sizes="50vw"
            priority
            className="auth-layout__background-image"
          />
        )}
      </div>
    </div>
  );
};

export default AuthLayout;