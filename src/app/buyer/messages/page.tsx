"use client";

import DashboardSidebar from "@/components/buyer/profile/DashboardSidebar";
import MessagesDashboard from "@/components/buyer/messages/MessagesDashboard";
import { getMessagesDemoData } from "@/lib/api/messages/messages";

import "./page.css";

export default function BuyerMessagesPage() {
  const messagesData = getMessagesDemoData();

  return (
    <div className="buyer-messages-page">
      <DashboardSidebar />

      <div className="buyer-messages-page__main">
        <MessagesDashboard data={messagesData} />
      </div>
    </div>
  );
}