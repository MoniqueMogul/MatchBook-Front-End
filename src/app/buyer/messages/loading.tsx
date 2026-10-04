import Sidebar from "@/components/dashboard/Sidebar";
import ContentSkeleton from "@/components/common/ContentSkeleton";
import "@/components/buyer/messages/MessagesDashboard.css";
import "./page.css";

export default function Loading() {
  return <div className="buyer-messages-page">
    <Sidebar activeItem="messages" />
    <div className="buyer-messages-page__main"><main className="messages-dashboard">
      <h1>Messages</h1>
      <ContentSkeleton shape="messages" label="Loading your messages" />
    </main></div>
  </div>;
}
