import { profile } from "@/data/profile";
import { ICONS } from "@/components/icons";

// The contact row under the landing panel. Icon-only: the label rides along as
// aria-label (assistive tech) and title (hover tooltip).
export default function ProfileLinks() {
  return (
    <ul className="profile-links">
      {profile.links.map((l) => {
        const Icon = ICONS[l.icon];
        return (
          <li key={l.label}>
            <a href={l.href} aria-label={l.label} title={l.label}>
              <Icon />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
