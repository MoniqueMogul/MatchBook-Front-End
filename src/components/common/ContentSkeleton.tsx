import "../buyer/profile/ProfileSkeleton.css";
import "./ContentSkeleton.css";

type Shape = "progress" | "matches" | "messages" | "documents" | "listings" | "business" | "account" | "options" | "photo";
const Line = ({ title = false }: { title?: boolean }) => <span className={`profile-skeleton__line${title ? " profile-skeleton__line--title" : ""}`} />;
const Rows = () => <>{[0, 1, 2].map(row => <div className="content-skeleton__row" key={row}><Line title /><Line /></div>)}</>;

export default function ContentSkeleton({ shape, label }: { shape: Shape; label: string }) {
  return <div className={`content-skeleton content-skeleton--${shape}`} role="status" aria-label={label} aria-busy="true">
    <div aria-hidden="true">
      {shape === "photo" ? <div className="content-skeleton__photo" />
        : shape === "options" ? <Line />
        : shape === "messages" ? <div className="content-skeleton__inbox"><div><Line title /><Rows /></div><div className="content-skeleton__conversation"><Line title /><div className="content-skeleton__bubble"><Line /><Line /></div><div className="content-skeleton__bubble content-skeleton__bubble--reply"><Line /></div></div></div>
        : shape === "listings" ? <><div className="content-skeleton__action" /><div className="content-skeleton__cards">{[0, 1].map(item => <div className="content-skeleton__card" key={item}><div className="content-skeleton__photo" /><Line title /><Line /></div>)}</div></>
        : shape === "matches" ? <div className="content-skeleton__match"><div className="content-skeleton__photo" /><div><Line title /><Line /><Line /><div className="content-skeleton__action" /></div><div><Rows /></div></div>
        : shape === "business" ? <><div className="content-skeleton__photo" /><div className="content-skeleton__panel"><Line title /><Line /><Rows /></div></>
        : shape === "progress" ? <div className="content-skeleton__panel"><Line title /><Line /><div className="content-skeleton__steps">{[0, 1, 2, 3, 4].map(step => <span key={step} />)}</div><div className="content-skeleton__action" /></div>
        : <div className="content-skeleton__panel"><Line title /><Rows /></div>}
    </div>
  </div>;
}
