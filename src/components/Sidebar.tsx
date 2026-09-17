import { profile } from "@/data/profile";
import ProfileLinks from "@/components/ProfileLinks";

// Persistent identity column, present on every route. It carries the portrait
// and contact details so interior pages are reachable-from too, and it does the
// measure control that a max-width cap used to do: the prose column is narrow
// because the sidebar takes the space, not because the page is capped.
export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Contact">
      <img
        className="portrait"
        src="/assets/profile.jpg"
        alt="Portrait of Bernardo Rivas"
        width={220}
        height={275}
      />
      <div className="side-id">
        <span className="side-name">{profile.name}</span>
        <span>Postdoc in Mathematics</span>
        <span>{profile.affiliation}</span>
      </div>
      <a className="side-email" href={`mailto:${profile.email}`}>{profile.email}</a>
      <ProfileLinks />
    </aside>
  );
}
