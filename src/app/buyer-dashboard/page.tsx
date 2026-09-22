'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import StepTrackerCard from '@/components/dashboard/StepTrackerCard';
import EmptyMatchesState from '@/components/dashboard/EmptyMatchesState';
import { useBuyerOnboardingStore } from '@/store/useBuyerOnboardingStore';
import type { StepData } from '@/components/dashboard/StepTrackerCard';

/* ------------------------------------------------------------------ */
/*  Default Onboarding Steps                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_STEPS: StepData[] = [
  { number: 1, label: 'Overview', status: 'completed' },
  { number: 2, label: 'Experience & Credentials', status: 'completed' },
  { number: 3, label: 'Acquisition Preferences', status: 'current' },
  { number: 4, label: 'Finances', status: 'upcoming' },
  { number: 5, label: 'Verification', status: 'upcoming' },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function BuyerDashboardNewUser() {
  const router = useRouter();
  const { aboutYou } = useBuyerOnboardingStore();

  /* Derive first name from store, fallback to "Nicole" */
  const fullName = aboutYou.fullName || 'Nicole';
  const firstName = fullName.split(' ')[0];

  const handleContinueProfile = () => {
    // Navigate to the next onboarding step
    router.push('/buyer-onboarding/about-you');
  };

  const handleNavigation = (id: string) => {
    // Placeholder for nav routing — extend as routes are built
    console.log(`Navigate to: ${id}`);
  };

  return (
    <div className="dashboard-shell">
      {/* Sidebar */}
      <Sidebar activeItem="home" onNavigate={handleNavigation} />

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-main__inner">
          {/* Heading */}
          <h1 className="dashboard-heading">Welcome In, {firstName}</h1>

          {/* Step Tracker Card */}
          <StepTrackerCard
            percentage={30}
            completedSections={2}
            totalSections={5}
            steps={DEFAULT_STEPS}
            ctaLabel="Continue your profile"
            onCtaClick={handleContinueProfile}
          />

          {/* Your matches section */}
          <h2 className="dashboard-section-heading">Your matches</h2>

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
