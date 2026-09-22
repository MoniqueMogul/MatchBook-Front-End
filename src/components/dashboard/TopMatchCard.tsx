import React from 'react';
import './dashboard.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface MatchListing {
  id: string;
  title: string;
  description: string;
  location: string;
  matchScore: number;
  askingPrice: string;
  revenue: string;
  profitSde: string;
  imageUrl: string;
}

interface TopMatchCardProps {
  match: MatchListing;
  /** Callback when "View Details" is clicked */
  onViewDetails?: (matchId: string) => void;
  /** Callback when "Request Intro" is clicked */
  onRequestIntro?: (matchId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const TopMatchCard: React.FC<TopMatchCardProps> = ({
  match,
  onViewDetails,
  onRequestIntro,
}) => {
  return (
    <article className="match-card" aria-label={`Match: ${match.title}`}>
      {/* Thumbnail */}
      <div className="match-card__thumbnail">
        <img
          className="match-card__image"
          src={match.imageUrl}
          alt={match.title}
          loading="lazy"
        />
      </div>

      {/* Content Panel */}
      <div className="match-card__content">
        {/* Top row: badge + location */}
        <div className="match-card__top-row">
          <span className="match-card__badge">{match.matchScore}% Match</span>
          <span className="match-card__location">{match.location}</span>
        </div>

        {/* Title */}
        <h3 className="match-card__title">{match.title}</h3>

        {/* Description */}
        <p className="match-card__description">{match.description}</p>

        {/* Action Buttons */}
        <div className="match-card__actions">
          <button
            className="match-card__btn match-card__btn--secondary"
            onClick={() => onViewDetails?.(match.id)}
          >
            View Details
          </button>
          <button
            className="match-card__btn match-card__btn--primary"
            onClick={() => onRequestIntro?.(match.id)}
          >
            Request Intro
          </button>
        </div>
      </div>

      {/* Financial Stats Column */}
      <div className="match-card__stats">
        <div className="match-card__stat">
          <span className="match-card__stat-label">Asking</span>
          <span className="match-card__stat-value">{match.askingPrice}</span>
        </div>
        <div className="match-card__stat">
          <span className="match-card__stat-label">Revenue</span>
          <span className="match-card__stat-value">{match.revenue}</span>
        </div>
        <div className="match-card__stat">
          <span className="match-card__stat-label">Profit (SDE)</span>
          <span className="match-card__stat-value match-card__stat-value--profit">
            {match.profitSde}
          </span>
        </div>
      </div>
    </article>
  );
};

export default TopMatchCard;
