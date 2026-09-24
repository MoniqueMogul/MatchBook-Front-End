import React from 'react';
import './dashboard.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface EmptyMatchesStateProps {
  /** Button label */
  buttonLabel?: string;
  /** Button click handler */
  onButtonClick?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const MagnifyingGlassIcon: React.FC = () => (
  <svg
    className="empty-matches__icon"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="9.5" cy="9.5" r="6" stroke="currentColor" strokeWidth="2" />
    <path d="M14 14L19.5 19.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const EmptyMatchesState: React.FC<EmptyMatchesStateProps> = ({
  buttonLabel = 'Finish your profile',
  onButtonClick,
}) => {
  return (
    <div className="empty-matches" role="status" aria-label="No matches available">
      {/* Icon */}
      <div className="empty-matches__icon-wrapper">
        <MagnifyingGlassIcon />
      </div>

      {/* Title */}
      <h3 className="empty-matches__title">No matches yet</h3>

      {/* Subtitle */}
      <p className="empty-matches__subtitle">
        We&apos;ll start matching you once your profile is complete. Finish the remaining
        sections to view matches.
      </p>

      {/* Secondary Button */}
      <button className="empty-matches__btn" onClick={onButtonClick}>
        {buttonLabel}
      </button>
    </div>
  );
};

export default EmptyMatchesState;
