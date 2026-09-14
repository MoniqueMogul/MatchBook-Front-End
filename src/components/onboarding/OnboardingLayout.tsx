import React from 'react';
import './onboarding.css';
import BrandLogo from './BrandLogo';
import ProgressBar from './ProgressBar';

interface OnboardingLayoutProps {
  /** Progress percentage (0–100) */
  progress: number;
  /** Main content rendered in the left column */
  children: React.ReactNode;
}

/**
 * OnboardingLayout — two-column shell for the buyer onboarding wizard.
 *
 * Left column:  730px, white, contains logo + progress bar + children
 * Right column: 710px flex-1, #EEF0F2 (neutral/100), centered "Image" placeholder
 */
const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ progress, children }) => {
  return (
    <div className="onboarding-layout">
      {/* Left Column — Form & Navigation */}
      <div className="onboarding-layout__left">
        <BrandLogo />
        <ProgressBar percent={progress} />
        {children}
      </div>

      {/* Right Column — Hero / Visual Placeholder */}
      <div className="onboarding-layout__right">
        <span className="onboarding-layout__placeholder-text">Image</span>
      </div>
    </div>
  );
};

export default OnboardingLayout;
