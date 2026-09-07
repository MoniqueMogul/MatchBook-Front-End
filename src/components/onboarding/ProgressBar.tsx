import React from 'react';
import './OnboardingComponents.css';

interface ProgressBarProps {
  /** Progress percentage (0–100) */
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div className="ob-progress" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div className="ob-progress__track">
        <div className="ob-progress__fill" style={{ width: `${clamped}%` }} />
      </div>
      <span className="ob-progress__label">{clamped}%</span>
    </div>
  );
};
