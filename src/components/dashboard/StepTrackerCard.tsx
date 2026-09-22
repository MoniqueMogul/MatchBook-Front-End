import React from 'react';
import './dashboard.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type StepStatus = 'completed' | 'current' | 'upcoming';

export interface StepData {
  /** Unique step number (1-based) */
  number: number;
  /** Display label beneath the circle */
  label: string;
  /** Current status of this step */
  status: StepStatus;
}

interface StepTrackerCardProps {
  /** Completion percentage (e.g., 30) */
  percentage: number;
  /** Number of completed sections */
  completedSections: number;
  /** Total number of sections */
  totalSections: number;
  /** Ordered list of step data */
  steps: StepData[];
  /** CTA button label */
  ctaLabel?: string;
  /** CTA button click handler */
  onCtaClick?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const SparkleIcon: React.FC = () => (
  <svg
    className="step-tracker__sparkle"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M8 0L9.79 5.53L16 5.88L11.12 9.67L12.94 16L8 12.18L3.06 16L4.88 9.67L0 5.88L6.21 5.53L8 0Z" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg
    className="step-tracker__step-check"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4.5 9L7.5 12L13.5 6"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StepCircle: React.FC<{ step: StepData }> = ({ step }) => {
  const modifier =
    step.status === 'completed'
      ? 'completed'
      : step.status === 'current'
      ? 'current'
      : 'upcoming';

  return (
    <div
      className={`step-tracker__step-circle step-tracker__step-circle--${modifier}`}
      aria-label={`Step ${step.number}: ${step.label} (${step.status})`}
    >
      {step.status === 'completed' ? (
        <CheckIcon />
      ) : step.status === 'current' ? (
        step.number
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const StepTrackerCard: React.FC<StepTrackerCardProps> = ({
  percentage,
  completedSections,
  totalSections,
  steps,
  ctaLabel = 'Continue your profile',
  onCtaClick,
}) => {
  return (
    <div className="step-tracker" role="region" aria-label="Profile completion progress">
      {/* Overline */}
      <div className="step-tracker__overline">
        <SparkleIcon />
        YOUR PROGRESS
      </div>

      {/* Stat row */}
      <div className="step-tracker__stat-row">
        <span className="step-tracker__percentage">{percentage}%</span>
        <div className="step-tracker__stat-text">
          <span className="step-tracker__headline">
            {completedSections} of {totalSections} sections complete
          </span>
          <span className="step-tracker__subtitle">
            You&apos;re halfway there. A complete profile means sharper, higher-confidence matches.
          </span>
        </div>
      </div>

      {/* Horizontal Stepper */}
      <div className="step-tracker__stepper" role="list" aria-label="Onboarding steps">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step */}
            <div className="step-tracker__step" role="listitem">
              <StepCircle step={step} />
              <span
                className={`step-tracker__step-label${
                  step.status === 'upcoming' ? ' step-tracker__step-label--upcoming' : ''
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (skip after last step) */}
            {index < steps.length - 1 && (
              <div className="step-tracker__connector" aria-hidden="true">
                <div
                  className={`step-tracker__connector-line ${
                    step.status === 'completed'
                      ? 'step-tracker__connector-line--active'
                      : 'step-tracker__connector-line--inactive'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* CTA */}
      <button className="step-tracker__cta" onClick={onCtaClick}>
        {ctaLabel}
      </button>
    </div>
  );
};

export default StepTrackerCard;
