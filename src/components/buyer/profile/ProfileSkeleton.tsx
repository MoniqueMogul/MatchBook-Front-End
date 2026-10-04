import "./ProfileSkeleton.css";

export default function ProfileSkeleton() {
  return <div className="profile-skeleton" role="status" aria-label="Loading profile" aria-busy="true">
    <div className="profile-skeleton__header" aria-hidden="true">
      <span className="profile-skeleton__avatar" />
      <div><span className="profile-skeleton__line profile-skeleton__line--title" /><span className="profile-skeleton__line" /></div>
    </div>
    <div className="profile-skeleton__tabs" aria-hidden="true"><span /><span /><span /></div>
    <div className="profile-skeleton__body" aria-hidden="true"><span className="profile-skeleton__line profile-skeleton__line--title" /><span className="profile-skeleton__line" /><span className="profile-skeleton__line" /></div>
  </div>;
}
