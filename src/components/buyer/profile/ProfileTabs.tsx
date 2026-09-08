"use client";

import "./ProfileTabs.css";

export type ProfileTab =
  | "overview"
  | "industry"
  | "acquisition"
  | "finances";

interface ProfileTabsProps {
  activeTab?: ProfileTab;
  onTabChange?: (tab: ProfileTab) => void;
}

const tabs: {
  id: ProfileTab;
  label: string;
}[] = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "industry",
    label: "Industry Background",
  },
  {
    id: "acquisition",
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
            aria-current={isActive ? "page" : undefined}
          >
            <span className="profile-tab__content">
              <span className="profile-tab__label">
                {tab.label}
              </span>

              <span
                className="profile-tab__underline"
                aria-hidden="true"
              />
            </span>
          </button>
        );
      })}
    </nav>
  );
}