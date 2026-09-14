import React from 'react';

interface ProgressBarProps {
  /** Current progress percentage (0–100) */
  percent: number;
}

/**
 * ProgressBar — horizontal track with filled portion and percentage label.
 *
 * Figma layer: progress bar > bar > progress fill + 10%
 * Track: 6px height, rounded-full, bg neutral/200
 * Fill:  width = percent%, bg primary/green (#3E7B42), rounded-full
 * Label: 14px, weight 500, neutral/700
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ percent }) => {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${clamped}%` }} />
      </div>
      <span className="progress-bar__label">{clamped}%</span>
    </div>
  );
};

export default ProgressBar;
