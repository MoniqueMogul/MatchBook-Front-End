"use client";

import {
  LayoutDashboard,
  FolderOpen,
  MessageCircle,
  Briefcase,
  FileText,
  Settings,
  CircleUser,
  Search,
  ChevronLeft,
} from "lucide-react";

import "./DashboardSidebar.css";

type NavigationItem = {
  label: string;
  icon: typeof LayoutDashboard;
  active?: boolean;
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
    icon: CircleUser,
    active: true,
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
  },
];

function NavigationItem({
  label,
  icon: Icon,
  active = false,
}: NavigationItem) {
  return (
    <button
      type="button"
      className={`sidebar-nav-item ${
        active ? "sidebar-nav-item-active" : ""
      }`}
      aria-current={active ? "page" : undefined}
    >
      <span className="sidebar-nav-icon">
        <Icon size={20} strokeWidth={1.5} />
      </span>

      <span className="sidebar-nav-label">{label}</span>
    </button>
  );
}

export default function DashboardSidebar() {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img
            src="/logo.png"
            alt="Matchbook"
            className="sidebar-logo-image"
          />
        </div>

        <button
          type="button"
          className="sidebar-collapse-button"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
      </div>

      <div className="sidebar-header-spacer" />

      <div className="sidebar-search">
        <Search
          size={20}
          strokeWidth={1.5}
          className="sidebar-search-icon"
          aria-hidden="true"
        />

        <span className="sidebar-search-text">Search</span>

        <span className="sidebar-search-shortcut">⌘K</span>
      </div>

      <nav className="sidebar-navigation" aria-label="Main navigation">
        <div className="sidebar-navigation-main">
          {mainNavigation.map((item) => (
            <NavigationItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              active={item.active}
            />
          ))}
        </div>

        <div className="sidebar-navigation-bottom">
          {bottomNavigation.map((item) => (
            <NavigationItem
              key={item.label}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
}