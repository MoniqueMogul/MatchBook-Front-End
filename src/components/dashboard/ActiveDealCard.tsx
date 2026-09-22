import React from 'react';
import './dashboard.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ActiveDeal {
  id: string;
  title: string;
  location: string;
  stage: 'Due Diligence' | 'NDA Signed';
  askingPrice: string;
  profitSde: string;
  ctaLabel: string;
  ctaVariant: 'primary' | 'secondary';
}

interface ActiveDealCardProps {
  deal: ActiveDeal;
  /** Callback when the CTA button is clicked */
  onCtaClick?: (dealId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ActiveDealCard: React.FC<ActiveDealCardProps> = ({ deal, onCtaClick }) => {
  const badgeModifier = deal.stage === 'Due Diligence' ? 'blue' : 'green';

  return (
    <article className="deal-card" aria-label={`Active deal: ${deal.title}`}>
      {/* Status Badge */}
      <span className={`deal-card__badge deal-card__badge--${badgeModifier}`}>
        {deal.stage}
      </span>

      {/* Title Block */}
      <div>
        <h3 className="deal-card__title">{deal.title}</h3>
        <p className="deal-card__location">{deal.location}</p>
      </div>

      {/* Divider */}
      <div className="deal-card__divider" aria-hidden="true" />

      {/* Metrics */}
      <div className="deal-card__metrics">
        <div>
          <span className="deal-card__metric-label">Asking</span>
          <div className="deal-card__metric-value">{deal.askingPrice}</div>
        </div>
        <div>
          <span className="deal-card__metric-label">Profit (SDE)</span>
          <div className="deal-card__metric-value">{deal.profitSde}</div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        className={`deal-card__btn deal-card__btn--${deal.ctaVariant}`}
        onClick={() => onCtaClick?.(deal.id)}
      >
        {deal.ctaLabel}
      </button>
    </article>
  );
};

export default ActiveDealCard;
