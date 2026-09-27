"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import "./dashboard.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
}

import {
  getBuyerProfilePath,
} from "@/lib/navigation/buyerProfile";

interface SidebarProps {
  /** Optional manual override for the active nav item */
  activeItem?: string;
  /** Optional callback when a nav item is clicked */
  onNavigate?: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Icon SVGs                                                          */
/* ------------------------------------------------------------------ */

const HomeIcon = () => (
  <svg
    className="sidebar__nav-icon"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 7.5L10 2L17 7.5V16.5C17 17.0523 16.5523 17.5 16 17.5H4C3.44772 17.5 3 17.0523 3 16.5V7.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 17.5V10.5H12V17.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BrowseIcon = () => (
  <svg
    className="sidebar__nav-icon"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="2.5"
      y="2.5"
      width="6"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="11.5"
      y="2.5"
      width="6"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="2.5"
      y="11.5"
      width="6"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <rect
      x="11.5"
      y="11.5"
      width="6"
      height="6"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const MessagesIcon = () => (
  <svg
    className="sidebar__nav-icon"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 9.5C17 13.366 13.866 16.5 10 16.5C9.13 16.5 8.3 16.34 7.53 16.05L3 17.5L4.55 13.47C3.58 12.29 3 10.8 3 9.5C3 5.634 6.134 2.5 10 2.5C13.866 2.5 17 5.634 17 9.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProfileIcon = () => (
  <svg
    className="sidebar__nav-icon"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="10"
      cy="7"
      r="3.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M3.5 17.5C3.5 14.186 6.186 11.5 10 11.5C13.814 11.5 16.5 14.186 16.5 17.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const DealsIcon = () => (
  <svg
    className="sidebar__nav-icon"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 2.5L12.39 7.36L17.5 8.11L13.75 11.86L14.68 17.5L10 14.89L5.32 17.5L6.25 11.86L2.5 8.11L7.61 7.36L10 2.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DocumentsIcon = () => (
  <svg
    className="sidebar__nav-icon"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.5 2.5H5.5C4.94772 2.5 4.5 2.94772 4.5 3.5V16.5C4.5 17.0523 4.94772 17.5 5.5 17.5H14.5C15.0523 17.5 15.5 17.0523 15.5 16.5V6.5L11.5 2.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.5 2.5V6.5H15.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 10.5H12.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M7.5 13.5H12.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg
    className="sidebar__nav-icon"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="10"
      cy="10"
      r="2.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M16.34 12.5C16.18 12.88 16.24 13.32 16.52 13.64L16.56 13.68C16.79 13.94 16.92 14.28 16.92 14.64C16.92 15 16.79 15.34 16.56 15.6C16.3 15.86 15.96 16 15.6 16C15.28 16 14.94 15.86 14.68 15.6L14.64 15.56C14.32 15.28 13.88 15.22 13.5 15.38C13.14 15.52 12.9 15.86 12.88 16.26V16.5C12.88 17.16 12.36 17.72 11.68 17.76C11.02 17.76 10.46 17.24 10.42 16.56V16.44C10.38 16.02 10.12 15.66 9.72 15.52C9.34 15.36 8.9 15.42 8.58 15.7L8.54 15.74C8.28 16 7.94 16.14 7.58 16.14C7.22 16.14 6.88 16 6.62 15.74C6.36 15.48 6.22 15.14 6.22 14.78C6.22 14.42 6.36 14.08 6.62 13.82L6.66 13.78C6.94 13.46 7 13.02 6.84 12.64C6.7 12.28 6.36 12.04 5.96 12.02H5.72C5.06 12.02 4.5 11.5 4.46 10.82C4.46 10.16 4.98 9.6 5.66 9.56H5.78C6.2 9.52 6.56 9.26 6.7 8.86C6.86 8.48 6.8 8.04 6.52 7.72L6.48 7.68C6.22 7.42 6.08 7.08 6.08 6.72C6.08 6.36 6.22 6.02 6.48 5.76C6.74 5.5 7.08 5.36 7.44 5.36C7.8 5.36 8.14 5.5 8.4 5.76L8.44 5.8C8.76 6.08 9.2 6.14 9.58 5.98H9.66C10.02 5.84 10.26 5.5 10.28 5.1V4.78C10.28 4.12 10.8 3.56 11.48 3.52C12.14 3.52 12.7 4.04 12.74 4.72V4.84C12.76 5.24 13 5.58 13.36 5.72C13.74 5.88 14.18 5.82 14.5 5.54L14.54 5.5C14.8 5.24 15.14 5.1 15.5 5.1C15.86 5.1 16.2 5.24 16.46 5.5C16.72 5.76 16.86 6.1 16.86 6.46C16.86 6.82 16.72 7.16 16.46 7.42L16.42 7.46C16.14 7.78 16.08 8.22 16.24 8.6V8.68C16.38 9.04 16.72 9.28 17.12 9.3H17.44C18.1 9.3 18.66 9.82 18.7 10.5C18.7 11.16 18.18 11.72 17.5 11.76H17.38C16.98 11.78 16.64 12.02 16.5 12.38L16.34 12.5Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AccountIcon = () => (
  <svg
    className="sidebar__nav-icon"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="10"
      cy="7.5"
      r="3"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M4 17.5C4 14.5 6.5 12 10 12C13.5 12 16 14.5 16 17.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="sidebar__search-icon"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="7"
      cy="7"
      r="4.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M10.5 10.5L14 14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Navigation Data                                                    */
/* ------------------------------------------------------------------ */

const MAIN_NAV: NavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: <HomeIcon />,
    path: "/buyer-dashboard",
  },
  {
    id: "browse",
    label: "Browse",
    icon: <BrowseIcon />,
  },
  {
    id: "messages",
    label: "Messages",
    icon: <MessagesIcon />,
  },
  {
    id: "profile",
    label: "Profile",
    icon: <ProfileIcon />,
    path: "/buyer-onboarding/profile",
  },
  {
    id: "deals",
    label: "Deals",
    icon: <DealsIcon />,
  },
  {
    id: "documents",
    label: "Documents",
    icon: <DocumentsIcon />,
  },
];

const FOOTER_NAV: NavItem[] = [
  {
    id: "settings",
    label: "Settings",
    icon: <SettingsIcon />,
  },
  {
    id: "account",
    label: "Account",
    icon: <AccountIcon />,
    path: "/buyer/account",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  onNavigate,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [searchValue, setSearchValue] = useState("");

  /* ---------------------------------------------------------------- */
  /*  Automatically determine active navigation item                  */
  /* ---------------------------------------------------------------- */

  const getActiveItem = () => {
    if (activeItem) {
      return activeItem;
    }

    if (pathname === "/buyer-dashboard") {
      return "home";
    }

    if (
      pathname === "/buyer-onboarding/profile" ||
      pathname.startsWith("/buyer-onboarding/profile/")
    ) {
      return "profile";
    }

    if (
      pathname === "/buyer/account" ||
      pathname.startsWith("/buyer/account/")
    ) {
      return "account";
    }

    return undefined;
  };

  const currentActiveItem = getActiveItem();

  /* ---------------------------------------------------------------- */
  /*  Navigation                                                       */
  /* ---------------------------------------------------------------- */

  const handleNavigation = (item: NavItem) => {
    onNavigate?.(item.id);

    if (item.id === "profile") {
      const profilePath =
        getBuyerProfilePath();

      if (pathname !== profilePath) {
        router.push(profilePath);
      }

      return;
    }

    if (item.path && pathname !== item.path) {
      router.push(item.path);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render Navigation Item                                          */
  /* ---------------------------------------------------------------- */

  const renderNavItem = (item: NavItem) => {
    const isActive = item.id === currentActiveItem;

    return (
      <li key={item.id} className="sidebar__nav-item">
        <button
          type="button"
          className={`sidebar__nav-link${
            isActive ? " sidebar__nav-link--active" : ""
          }`}
          onClick={() => handleNavigation(item)}
          aria-current={isActive ? "page" : undefined}
        >
          {item.icon}
          {item.label}
        </button>
      </li>
    );
  };

  return (
    <aside className="sidebar" aria-label="Main navigation">
      {/* Header: Logo + Collapse */}
      <div className="sidebar__header">
        <div className="sidebar__logo" aria-label="Matchbook">
          <svg
            className="sidebar__logo-mark"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="28" height="28" rx="4" fill="#3E7B42" />
            <path
              d="M7 8h2l5 6 5-6h2v12h-2V12.5L14 18l-5-5.5V20H7V8z"
              fill="#ffffff"
            />
          </svg>

          <span className="sidebar__logo-wordmark">matchbook</span>
        </div>

        <button
          type="button"
          className="sidebar__collapse-btn"
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="sidebar__search">
        <SearchIcon />

        <input
          className="sidebar__search-input"
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          aria-label="Search"
        />

        <span
          className="sidebar__search-shortcut"
          aria-hidden="true"
        >
          ⌘K
        </span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <ul className="sidebar__nav-group">
          {MAIN_NAV.map(renderNavItem)}
        </ul>

        <ul className="sidebar__nav-group sidebar__nav-group--footer">
          {FOOTER_NAV.map(renderNavItem)}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;