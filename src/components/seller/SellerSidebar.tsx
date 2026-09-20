"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutGrid,
  Folder,
  MessageCircle,
  CreditCard,
  Briefcase,
  FileText,
  Settings,
  User,
  Search,
} from "lucide-react";
import "./SellerSidebar.css";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const MAIN_ITEMS: NavItem[] = [
  { label: "Home", href: "/home", icon: LayoutGrid },
  { label: "Browse", href: "/browse", icon: Folder },
  { label: "Messages", href: "/messages", icon: MessageCircle },
  { label: "Profile", href: "/seller/listings", icon: CreditCard },
  { label: "Deals", href: "/deals", icon: Briefcase },
  { label: "Documents", href: "/documents", icon: FileText },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Account", href: "/seller/account", icon: User },
];

export default function SellerSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="seller-sidebar">
      <div className="seller-sidebar__header">
        <div className="seller-sidebar__logo">
          <span className="seller-sidebar__logo-mark">M</span>
          <span className="seller-sidebar__logo-text">matchbook</span>
        </div>
        <button className="seller-sidebar__collapse" aria-label="Collapse">
          ‹
        </button>
      </div>

      <div className="seller-sidebar__search">
        <Search size={16} strokeWidth={1.8} />
        <input placeholder="Search" />
        <span className="seller-sidebar__kbd">⌘K</span>
      </div>

      <nav className="seller-sidebar__nav">
        {MAIN_ITEMS.map((item) => {
          const active = item.href ? pathname.startsWith(item.href) : false;
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => item.href && router.push(item.href)}
              className={`seller-sidebar__item ${active ? "seller-sidebar__item--active" : ""}`}
            >
              <Icon size={20} strokeWidth={1.6} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="seller-sidebar__bottom">
        {BOTTOM_ITEMS.map((item) => {
          const active = item.href ? pathname.startsWith(item.href) : false;
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => item.href && router.push(item.href)}
              className={`seller-sidebar__item ${active ? "seller-sidebar__item--active" : ""}`}
            >
              <Icon size={20} strokeWidth={1.6} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}