import Sidebar from "@/components/dashboard/Sidebar";
import ContentSkeleton from "@/components/common/ContentSkeleton";

export default function Loading() {
  return <div className="dashboard-shell">
    <Sidebar activeItem="home" />
    <main className="dashboard-main"><div className="dashboard-main__inner">
      <h1 className="dashboard-heading">Welcome in</h1>
      <ContentSkeleton shape="progress" label="Loading your saved preferences" />
      <h2 className="dashboard-section-heading">Your matches</h2>
      <ContentSkeleton shape="matches" label="Loading your matches" />
    </div></main>
  </div>;
}
