"use client";

import { useRouter } from "next/navigation";

import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import AccountDetails from "@/components/buyer/account/AccountDetails";

import "./page.css";

export default function BuyerAccountPage() {
  const router = useRouter();

  return (
    <div className="buyer-account-page">
      <DashboardSidebar />

      <div className="buyer-account-page__main">
        <AccountDetails
          onEdit={() => {
            router.push("/buyer/account/edit");
          }}
        />
      </div>
    </div>
  );
}