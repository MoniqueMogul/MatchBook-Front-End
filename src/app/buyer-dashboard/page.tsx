'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import Sidebar from '@/components/dashboard/Sidebar';
import StepTrackerCard from '@/components/dashboard/StepTrackerCard';
import EmptyMatchesState from '@/components/dashboard/EmptyMatchesState';

import { useBuyerOnboardingStore } from '@/store/useBuyerOnboardingStore';
import type {
  StepData,
} from '@/components/dashboard/StepTrackerCard';

import { supabase } from '@/lib/supabase';

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function BuyerDashboardNewUser() {
  const router = useRouter();

  const completedSections =
    useBuyerOnboardingStore(
      (state) => state.completedSections
    );

  const initializeForUser =
    useBuyerOnboardingStore(
      (state) => state.initializeForUser
    );

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
        data: { user },
        error,
      } = await supabase.auth.getUser();

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
      } catch (error) {
        console.error(
          'Failed to initialize buyer onboarding:',
          error
        );
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

      const metadata =
        user.user_metadata ?? {};

      const firstNameFromMetadata =
        typeof metadata.first_name === 'string'
          ? metadata.first_name.trim()
          : '';

      const lastNameFromMetadata =
        typeof metadata.last_name === 'string'
          ? metadata.last_name.trim()
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
  /*  Continue Profile                                                */
  /* ---------------------------------------------------------------- */

  const handleContinueProfile = () => {
    router.push(
      '/buyer-onboarding/profile'
    );
  };

  /* ---------------------------------------------------------------- */
  /*  Sidebar Navigation                                              */
  /* ---------------------------------------------------------------- */

  const handleNavigation = (
    id: string
  ) => {
    if (id === 'home') {
      router.push('/buyer-dashboard');
      return;
    }

    console.log(
      `Navigate to: ${id}`
    );
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

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
            Welcome In
            {firstName
              ? `, ${firstName}`
              : ''}
          </h1>

          {/* Step Tracker Card */}
          <StepTrackerCard
            percentage={percentage}
            completedSections={completedCount}
            totalSections={totalSections}
            steps={steps}
            ctaLabel="Continue your profile"
            onCtaClick={
              handleContinueProfile
            }
          />

          {/* Your matches section */}
          <h2 className="dashboard-section-heading">
            Your matches
          </h2>

          <EmptyMatchesState
            buttonLabel="Finish your profile"
            onButtonClick={
              handleContinueProfile
            }
          />
        </div>
      </main>
    </div>
  );
}