"use client";

import "./ProfileTabs.css";

export type ProfileTab =
  | "overview"
  | "industry-experience"
  | "acquisition-preferences"
  | "finances";

interface ProfileTabsProps {
  activeTab?: ProfileTab;
  onTabChange?: (tab: ProfileTab) => void;
  onboarding?: boolean;
}

const tabs: Array<{
  id: ProfileTab;
  label: string;
}> = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "industry-experience",
    label: "Experience & Credentials",
  },
  {
    id: "acquisition-preferences",
    label: "Acquisition Preferences",
  },
  {
    id: "finances",
    label: "Finances",
  },
];

export default function ProfileTabs({
  activeTab = "overview",
  onTabChange,
  onboarding = false,
}: ProfileTabsProps) {
  const activeIndex = tabs.findIndex(
    (tab) => tab.id === activeTab,
  );

  return (
    <nav
      className="profile-tabs"
      aria-label="Profile sections"
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;

        /*
         * During onboarding, users can only access:
         * - the current section
         * - sections they have already completed
         *
         * Future sections remain disabled.
         *
         * In normal edit mode, every tab remains clickable.
         */
        const isFutureTab =
          onboarding && index > activeIndex;

        const isDisabled = isFutureTab;

        return (
          <button
            key={tab.id}
            type="button"
            className={`profile-tab ${
              isActive ? "profile-tab--active" : ""
            } ${
              isDisabled
                ? "profile-tab--disabled"
                : ""
            }`}
            onClick={() => {
              if (!isDisabled) {
                onTabChange?.(tab.id);
              }
            }}
            disabled={isDisabled}
            aria-current={
              isActive ? "page" : undefined
            }
            aria-disabled={
              isDisabled ? true : undefined
            }
          >
            <span className="profile-tab__label">
              {tab.label}
            </span>

            {isActive && (
              <span
                className="profile-tab__underline"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}