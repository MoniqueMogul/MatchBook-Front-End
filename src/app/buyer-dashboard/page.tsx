'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import StepTrackerCard from '@/components/dashboard/StepTrackerCard';
import EmptyMatchesState from '@/components/dashboard/EmptyMatchesState';
import TopMatchCard from '@/components/dashboard/TopMatchCard';
import type { MatchListing } from '@/components/dashboard/TopMatchCard';
import { getBuyerMatches } from '@/lib/api/matching/matching';
import type { ApiMatchResponse } from '@/lib/api/matching/matching.types';
import { useBuyerOnboardingStore } from '@/store/useBuyerOnboardingStore';
import type { StepData } from '@/components/dashboard/StepTrackerCard';
import { supabase } from '@/lib/supabase';

/* ------------------------------------------------------------------ */
/*  Default Onboarding Steps                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_STEPS: StepData[] = [
  {
    number: 1,
    label: 'Overview',
    status: 'current',
  },
  {
    number: 2,
    label: 'Experience & Credentials',
    status: 'upcoming',
  },
  {
    number: 3,
    label: 'Acquisition Preferences',
    status: 'upcoming',
  },
  {
    number: 4,
    label: 'Finances',
    status: 'upcoming',
  },
  {
    number: 5,
    label: 'Verification',
    status: 'upcoming',
  },
];

const MATCH_IMAGE_PATHS = [
  '/images/listings/coffee-roastery.jpg',
  '/images/listings/coffee-cart.jpg',
  '/images/listings/coffee-subscription.jpg',
] as const;

function formatCurrency(value: string | null): string {
  if (value === null) {
    return 'Not provided';
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 'Not provided';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatIndustry(value: string): string {
  return value
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(' ');
}

function mapMatchToListing(
  match: ApiMatchResponse,
  index: number
): MatchListing {
  const numericScore = Number(match.score);

  const matchScore = Number.isFinite(numericScore)
    ? Math.max(
        0,
        Math.min(100, Math.round(numericScore * 100))
      )
    : 0;

  const title =
    match.business.dba ??
    match.business.legal_name ??
    'Confidential business';

  const industry = formatIndustry(
    match.business.industry
  );

  return {
    id: match.id,
    title,
    description:
      `${industry} opportunity matched to your acquisition preferences.`,
    location: [match.business.city, match.business.state]
      .filter(Boolean)
      .join(', '),
    matchScore,
    askingPrice: formatCurrency(
      match.business.asking_price
    ),
    revenue: formatCurrency(match.business.arr),
    profitSde: formatCurrency(match.business.sde),
    imageUrl:
      MATCH_IMAGE_PATHS[
        index % MATCH_IMAGE_PATHS.length
      ],
  };
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function BuyerDashboardNewUser() {
  const router = useRouter();
  const completedSections =
    useBuyerOnboardingStore(
      (state) => state.completedSections
    );
    const totalSections = 5;

    const completedCount = Object.values(
      completedSections
    ).filter(Boolean).length;

    const percentage = Math.round(
      (completedCount / totalSections) * 100
    );

  const [firstName, setFirstName] = React.useState('');
  const [matches, setMatches] = React.useState<
    MatchListing[]
  >([]);
  const [isLoadingMatches, setIsLoadingMatches] =
    React.useState(true);
  const [matchesError, setMatchesError] =
    React.useState('');

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


      if (firstNameFromMetadata) {
        setFirstName(firstNameFromMetadata);
        return;
      }

      /*
       * Fallback in case first_name is not available but
       * a full_name was stored during signup.
       */
      const fullNameFromMetadata =
        typeof metadata.full_name === 'string'
          ? metadata.full_name.trim()
          : '';

      if (fullNameFromMetadata) {
        setFirstName(fullNameFromMetadata.split(' ')[0]);
        return;
      }

      /*
       * Final fallback to the authenticated email.
       * This avoids displaying a hardcoded person's name.
       */
      if (user.email) {
        setFirstName(user.email.split('@')[0]);
      }
    };

    getUserName();
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Load authenticated buyer matches                                */
  /* ---------------------------------------------------------------- */

  React.useEffect(() => {
    let isActive = true;

    const loadMatches = async () => {
      try {
        const response = await getBuyerMatches();

        if (!isActive) {
          return;
        }

        setMatches(
          response.matches.map(mapMatchToListing)
        );
        setMatchesError('');
      } catch (error) {
        if (!isActive) {
          return;
        }

        setMatches([]);
        setMatchesError(
          error instanceof Error
            ? error.message
            : 'Unable to load your matches.'
        );
      } finally {
        if (isActive) {
          setIsLoadingMatches(false);
        }
      }
    };

    loadMatches();

    return () => {
      isActive = false;
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Continue Profile                                                */
  /* ---------------------------------------------------------------- */

  const handleContinueProfile = () => {
    router.push('/buyer-onboarding/profile');
  };

  const handleViewMatch = (matchId: string) => {
    router.push(`/buyer/matches/${matchId}`);
  };

  const handleRequestIntroduction = (
    matchId: string
  ) => {
    router.push(`/buyer/matches/${matchId}`);
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
          {/* Heading */}
          <h1 className="dashboard-heading">
            Welcome In{firstName ? `, ${firstName}` : ''}
          </h1>

          {/* Step Tracker Card */}
          <StepTrackerCard
            percentage={percentage}
            completedSections={completedCount}
            totalSections={totalSections}
            steps={DEFAULT_STEPS}
            ctaLabel="Continue your profile"
            onCtaClick={handleContinueProfile}
          />

          {/* Your matches section */}
          <h2 className="dashboard-section-heading">
            Your matches
          </h2>

          {isLoadingMatches ? (
            <p role="status">
              Loading your matches...
            </p>
          ) : matchesError ? (
            <p role="alert">
              {matchesError}
            </p>
          ) : matches.length > 0 ? (
            <div className="top-matches__container">
              {matches.map((match) => (
                <TopMatchCard
                  key={match.id}
                  match={match}
                  onViewDetails={handleViewMatch}
                  onRequestIntro={
                    handleRequestIntroduction
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyMatchesState
              buttonLabel="Finish your profile"
              onButtonClick={handleContinueProfile}
            />
          )}
        </div>
      </main>
    </div>
  );
}