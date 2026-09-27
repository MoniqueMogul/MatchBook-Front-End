"use client";

import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  FolderOpen,
  MessageCircle,
  CreditCard,
  Briefcase,
  FileText,
  Settings,
  CircleUser,
  Search,
  ChevronLeft,
} from "lucide-react";

import "./DashboardSidebar.css";
import {
  getBuyerProfilePath,
} from "@/lib/navigation/buyerProfile";
type NavigationItem = {
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
};

const mainNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Browse",
    icon: FolderOpen,
  },
  {
    label: "Messages",
    icon: MessageCircle,
  },
  {
    label: "Profile",
    icon: CreditCard,
  },
  {
    label: "Deals",
    icon: Briefcase,
  },
  {
    label: "Documents",
    icon: FileText,
  },
];

const bottomNavigation: NavigationItem[] = [
  {
    label: "Settings",
    icon: Settings,
  },
  {
    label: "Account",
    icon: CircleUser,
    href: "/buyer/account",
  },
];

function NavigationItem({
  label,
  icon: Icon,
  href,
  active,
}: NavigationItem & { active: boolean }) {
  const router = useRouter();

  const handleClick = () => {
    if (label === "Profile") {
      router.push(getBuyerProfilePath());
      return;
    }

    if (href) {
      router.push(href);
    }
  };

  return (
    <button
      type="button"
      className={`dashboard-sidebar__nav-item ${
        active
          ? "dashboard-sidebar__nav-item--active"
          : ""
      }`}
      aria-current={active ? "page" : undefined}
      onClick={handleClick}
    >
      <span className="dashboard-sidebar__nav-item-icon">
        <Icon
          size={20}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </span>

      <span className="dashboard-sidebar__nav-item-label">
        {label}
      </span>
    </button>
  );
}

function BottomNavigationItem({
  label,
  icon: Icon,
  href,
  active,
}: NavigationItem & { active: boolean }) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <button
      type="button"
      className={`dashboard-sidebar__bottom-item ${
        active
          ? "dashboard-sidebar__bottom-item--active"
          : ""
      }`}
      aria-current={active ? "page" : undefined}
      onClick={handleClick}
    >
      <span className="dashboard-sidebar__bottom-item-icon">
        <Icon
          size={20}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </span>

      <span className="dashboard-sidebar__bottom-item-label">
        {label}
      </span>
    </button>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar">
      {/* Header */}
      <div className="dashboard-sidebar__header">
        <img
          src="/logo.png"
          alt="Matchbook"
          className="dashboard-sidebar__logo"
        />

        <button
          type="button"
          className="dashboard-sidebar__collapse"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft
            size={20}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Search */}
      <div className="dashboard-sidebar__search">
        <span className="dashboard-sidebar__search-icon">
          <Search
            size={20}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </span>

        <span className="dashboard-sidebar__search-text">
          Search
        </span>

        <span className="dashboard-sidebar__search-shortcut">
          ⌘K
        </span>
      </div>

      {/* Main navigation */}
      <nav
        className="dashboard-sidebar__nav"
        aria-label="Main navigation"
      >
        {mainNavigation.map((item) => {
           const isActive =
            item.label === "Profile"
              ? pathname.startsWith("/buyer/profile") ||
                pathname.startsWith("/buyer-onboarding/profile")
              : item.href !== undefined &&
                pathname.startsWith(item.href);

          return (
            <NavigationItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              href={item.href}
              active={isActive}
            />
          );
        })}
      </nav>

      {/* Push bottom navigation to the bottom */}
      <div className="dashboard-sidebar__spacer" />

      {/* Bottom navigation */}
      <div className="dashboard-sidebar__bottom">
        {bottomNavigation.map((item) => {
          const isActive =
            item.href !== undefined &&
            pathname.startsWith(item.href);

          return (
            <BottomNavigationItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              href={item.href}
              active={isActive}
            />
          );
        })}
      </div>
    </aside>
  );
}