'use client';

import ContentSkeleton from "@/components/common/ContentSkeleton";
import React from 'react';
import axios from 'axios';
import { getBuyerProfile } from '@/lib/api/buyer';
import { getCurrentUser, getProfileImage } from '@/lib/api/user';
import { getBuyerPreferences } from '@/lib/api/buyerPreferences';
import { getBuyerReadiness } from '@/lib/api/buyerPreferences';
import { useRouter } from 'next/navigation';

import Sidebar from '@/components/dashboard/Sidebar';
import StepTrackerCard from '@/components/dashboard/StepTrackerCard';
import EmptyMatchesState from '@/components/dashboard/EmptyMatchesState';
import TopMatchCard from '@/components/dashboard/TopMatchCard';
import type { MatchListing } from '@/components/dashboard/TopMatchCard';
import { getBuyerMatches } from '@/lib/api/matching/matching';
import type { ApiMatchResponse } from '@/lib/api/matching/matching.types';
import { useBuyerOnboardingStore } from '@/store/useBuyerOnboardingStore';
import type {
  StepData,
} from '@/components/dashboard/StepTrackerCard';

import { supabase } from '@/lib/supabase';

/* ------------------------------------------------------------------ */
/*  Match helpers                                                     */
/* ------------------------------------------------------------------ */

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
  match: ApiMatchResponse
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
    imageUrl: match.business.profile_image_url ?? undefined,
  };
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function BuyerDashboardNewUser() {
  const router = useRouter();
  React.useEffect(() => {
    void Promise.allSettled([getCurrentUser(), getBuyerProfile(), getBuyerPreferences(), getProfileImage()]);
  }, []);

  const completedSections =
    useBuyerOnboardingStore(
      (state) => state.completedSections
    );

  const initializeForUser =
    useBuyerOnboardingStore(
      (state) => state.initializeForUser
    );

  const [preferencesReady, setPreferencesReady] = React.useState<boolean | null>(null);
  const [readinessError, setReadinessError] = React.useState('');

  const totalSections = 5;

  const completedCount =
    Object.values(completedSections).filter(Boolean).length;

  const percentage = Math.round(
    (completedCount / totalSections) * 100
  );

  /* ---------------------------------------------------------------- */
  /*  Initialize user-specific onboarding state                       */
  /* ---------------------------------------------------------------- */

  React.useEffect(() => {
    let cancelled = false;

    const initializeOnboarding = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (error) {
        console.error(
          'Failed to get authenticated user:',
          error
        );
        return;
      }

      if (!user || cancelled) {
        return;
      }

      try {
        await initializeForUser(user.id);
        const readiness = await getBuyerReadiness();
        if (!cancelled) setPreferencesReady(readiness.ready);
      } catch (error) {
        if (!cancelled) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setPreferencesReady(false);
          } else {
            setReadinessError('Unable to check your saved preferences. Please refresh to try again.');
          }
        }
      }
    };

    initializeOnboarding();

    return () => {
      cancelled = true;
    };
  }, [initializeForUser]);

  /* ---------------------------------------------------------------- */
  /*  Build dynamic onboarding steps                                  */
  /* ---------------------------------------------------------------- */

  const sectionDefinitions: {
    key: keyof typeof completedSections;
    number: number;
    label: string;
  }[] = [
    {
      key: 'overview',
      number: 1,
      label: 'Overview',
    },
    {
      key: 'experience',
      number: 2,
      label: 'Experience & Credentials',
    },
    {
      key: 'acquisition',
      number: 3,
      label: 'Acquisition Preferences',
    },
    {
      key: 'finances',
      number: 4,
      label: 'Finances',
    },
    {
      key: 'verification',
      number: 5,
      label: 'Verification',
    },
  ];

  const firstIncompleteIndex =
    sectionDefinitions.findIndex(
      (section) =>
        !completedSections[section.key]
    );

  const steps: StepData[] =
    sectionDefinitions.map(
      (section, index) => {
        const isCompleted =
          completedSections[section.key];

        const isCurrent =
          !isCompleted &&
          index === firstIncompleteIndex;

        return {
          number: section.number,
          label: section.label,
          status: isCompleted
            ? 'completed'
            : isCurrent
              ? 'current'
              : 'upcoming',
        };
      }
    );

  /* ---------------------------------------------------------------- */
  /*  User name                                                       */
  /* ---------------------------------------------------------------- */

  const [firstName, setFirstName] =
    React.useState('');
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
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        return;
      }

      const metadata =
        user.user_metadata ?? {};

      const firstNameFromMetadata =
        typeof metadata.first_name === 'string'
          ? metadata.first_name.trim()
          : '';


      if (firstNameFromMetadata) {
        setFirstName(
          firstNameFromMetadata
        );
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
        setFirstName(
          fullNameFromMetadata.split(' ')[0]
        );
        return;
      }

      /*
       * Final fallback to the authenticated email.
       * This avoids displaying a hardcoded person's name.
       */
      if (user.email) {
        setFirstName(
          user.email.split('@')[0]
        );
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
    router.push(
      preferencesReady ? '/buyer/profile' : '/buyer-onboarding/profile'
    );
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

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="dashboard-shell">
      {/* Sidebar */}
      <Sidebar
        activeItem="home"
      />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-main__inner">
          {/* Heading */}
          <h1 className="dashboard-heading">
            Welcome in
            {firstName
              ? `, ${firstName}`
              : ''}
          </h1>

          {/* Step Tracker Card */}
          {readinessError ? <p role="alert">{readinessError}</p> : preferencesReady === null ? (
            <ContentSkeleton shape="progress" label="Loading your saved preferences" />
          ) : !preferencesReady ? <StepTrackerCard
            percentage={percentage}
            completedSections={completedCount}
            totalSections={totalSections}
            steps={steps}
            ctaLabel="Continue your profile"
            onCtaClick={
              handleContinueProfile
            }
          /> : null}

          {/* Your matches section */}
          <h2 className="dashboard-section-heading">
            Your matches
          </h2>

          {isLoadingMatches ? (
            <ContentSkeleton shape="matches" label="Loading your matches" />
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
          ) : preferencesReady !== null && !readinessError ? (
            <EmptyMatchesState
              profileReady={preferencesReady}
              buttonLabel={preferencesReady ? 'View your profile' : 'Finish your profile'}
              onButtonClick={handleContinueProfile}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}
