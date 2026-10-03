'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import ActiveDealCard from '@/components/dashboard/ActiveDealCard';
import TopMatchCard from '@/components/dashboard/TopMatchCard';
import type { ActiveDeal } from '@/components/dashboard/ActiveDealCard';
import type { MatchListing } from '@/components/dashboard/TopMatchCard';
import { supabase } from '@/lib/supabase';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const ACTIVE_DEALS: ActiveDeal[] = [
  {
    id: 'deal-1',
    title: 'Specialty Coffee Roastery',
    location: 'Portland, OR',
    stage: 'Due Diligence',
    askingPrice: '$750K',
    profitSde: '$200K',
    ctaLabel: 'Open Deal Room',
    ctaVariant: 'primary',
  },
  {
    id: 'deal-2',
    title: 'Commercial Bakery',
    location: 'Hillsboro, OR',
    stage: 'NDA Signed',
    askingPrice: '$920K',
    profitSde: '$240K',
    ctaLabel: 'View Financials',
    ctaVariant: 'secondary',
  },
];

const TOP_MATCHES: MatchListing[] = [
  {
    id: 'match-1',
    title: 'Unique Craft Roastery & Cold Brew Lab',
    description:
      'High-margin packaged cold-brew supply into regional grocery chains.',
    location: 'Portland, OR',
    matchScore: 98,
    askingPrice: '$680K',
    revenue: '$780K',
    profitSde: '$185K',
    imageUrl: '/images/listings/coffee-roastery.jpg',
  },
  {
    id: 'match-2',
    title: 'Artisan Coffee Cart & Event Services',
    description:
      'Mobile coffee cart servicing local events and gatherings, with a focus on unique blends.',
    location: 'Austin, TX',
    matchScore: 95,
    askingPrice: '$450K',
    revenue: '$500K',
    profitSde: '$120K',
    imageUrl: '/images/listings/coffee-cart.jpg',
  },
  {
    id: 'match-3',
    title: 'Sustainable Coffee Subscription Box',
    description:
      'Monthly subscription service offering ethically sourced coffees from around the globe.',
    location: 'Tampa, FL',
    matchScore: 92,
    askingPrice: '$1.2M',
    revenue: '$1.5M',
    profitSde: '$300K',
    imageUrl: '/images/listings/coffee-subscription.jpg',
  },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function BuyerDashboardReturningUser() {
  const router = useRouter();

  const [firstName, setFirstName] = React.useState('');

  /* ---------------------------------------------------------------- */
  /*  Get authenticated user's real name                              */
  /* ---------------------------------------------------------------- */

  React.useEffect(() => {
    const getUserName = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const metadata = user.user_metadata ?? {};

      const firstNameFromMetadata =
        typeof metadata.first_name === 'string'
          ? metadata.first_name.trim()
          : '';

      const fullNameFromMetadata =
        typeof metadata.full_name === 'string'
          ? metadata.full_name.trim()
          : '';

      if (firstNameFromMetadata) {
        setFirstName(firstNameFromMetadata);
        return;
      }

      if (fullNameFromMetadata) {
        setFirstName(fullNameFromMetadata.split(' ')[0]);
        return;
      }

      /*
       * Final fallback if no name metadata exists.
       * This keeps the name dynamic and avoids hardcoded names.
       */
      if (user.email) {
        setFirstName(user.email.split('@')[0]);
      }
    };

    getUserName();
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Deal / Match Actions                                            */
  /* ---------------------------------------------------------------- */

  const handleDealCta = (dealId: string) => {
    console.log(`Deal CTA clicked: ${dealId}`);
  };

  const handleViewDetails = (matchId: string) => {
    console.log(`View Details: ${matchId}`);
  };

  const handleRequestIntro = (matchId: string) => {
    console.log(`Request Intro: ${matchId}`);
  };

  /* ---------------------------------------------------------------- */
  /*  Sidebar Navigation                                              */
  /* ---------------------------------------------------------------- */

  const handleNavigation = (id: string) => {
    if (id === 'home') {
      router.push('/buyer-dashboard');
      return;
    }

    console.log(`Navigate to: ${id}`);
  };

  return (
    <div className="dashboard-shell">
      {/* Sidebar */}
      <Sidebar
        activeItem="home"
        onNavigate={handleNavigation}
      />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-main__inner">
          {/* Header */}
          <h1 className="dashboard-heading dashboard-heading--compact">
            Welcome in{firstName ? `, ${firstName}` : ''}
          </h1>

          <p className="dashboard-subtitle">
            Target: Pacific NW &nbsp;•&nbsp; Food Industry &nbsp;•&nbsp; $500K – $1.5M
          </p>

          {/* Divider */}
          <div className="dashboard-divider" aria-hidden="true" />

          {/* Active Deals Section */}
          <div className="dashboard-section-title-row">
            <h2 className="dashboard-section-title">Active Deals</h2>

            <span
              className="dashboard-section-count"
              aria-label={`${ACTIVE_DEALS.length} active deals`}
            >
              {ACTIVE_DEALS.length}
            </span>
          </div>

          <div className="active-deals__container">
            {ACTIVE_DEALS.map((deal) => (
              <ActiveDealCard
                key={deal.id}
                deal={deal}
                onCtaClick={handleDealCta}
              />
            ))}
          </div>

          {/* Top Matches Section */}
          <div
            className="dashboard-section-title-row"
            style={{ marginTop: 32 }}
          >
            <h2 className="dashboard-section-title">Top Matches</h2>

            <span
              className="dashboard-section-count"
              aria-label={`${TOP_MATCHES.length} top matches`}
            >
              {TOP_MATCHES.length}
            </span>
          </div>

          <div className="top-matches__container">
            {TOP_MATCHES.map((match) => (
              <TopMatchCard
                key={match.id}
                match={match}
                onViewDetails={handleViewDetails}
                onRequestIntro={handleRequestIntro}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}