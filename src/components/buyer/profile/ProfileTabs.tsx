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
}: ProfileTabsProps) {
  return (
    <nav
      className="profile-tabs"
      aria-label="Profile sections"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            className={`profile-tab ${
              isActive ? "profile-tab--active" : ""
            }`}
            onClick={() => onTabChange?.(tab.id)}
            aria-current={
              isActive ? "page" : undefined
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