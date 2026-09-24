'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import StepTrackerCard from '@/components/dashboard/StepTrackerCard';
import EmptyMatchesState from '@/components/dashboard/EmptyMatchesState';
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

      const lastNameFromMetadata =
        typeof metadata.last_name === 'string'
          ? metadata.last_name.trim()
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
  /*  Continue Profile                                                */
  /* ---------------------------------------------------------------- */

  const handleContinueProfile = () => {
    router.push('/buyer-onboarding/profile');
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

          {/* Empty Matches State */}
          <EmptyMatchesState
            buttonLabel="Finish your profile"
            onButtonClick={handleContinueProfile}
          />
        </div>
      </main>
    </div>
  );
}