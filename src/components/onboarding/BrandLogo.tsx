import React from 'react';

/**
 * BrandLogo — Matchbook inline SVG mark + wordmark.
 * Matches the Figma layer: Logo > matchbook-logo 1 + wordmark ("matchbook")
 */
const BrandLogo: React.FC = () => {
  return (
    <div className="brand-logo" aria-label="Matchbook">
      {/* Vector mark – simplified book / "M" icon */}
      <svg
        className="brand-logo__mark"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="28" height="28" rx="4" fill="#3E7B42" />
        <path
          d="M7 8h2l5 6 5-6h2v12h-2V12.5L14 18l-5-5.5V20H7V8z"
          fill="#ffffff"
        />
      </svg>
      <span className="brand-logo__wordmark">matchbook</span>
    </div>
  );
};

export default BrandLogo;
