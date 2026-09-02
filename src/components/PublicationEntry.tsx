import type { Publication } from "@/data/types";
import { highlightSelf } from "@/lib/authors";

// One paper: a year or group label in the left rail, then title, authors,
// venue-or-status, and direct links. Passing null leaves the rail blank.
export default function PublicationEntry({
  entry,
  railLabel,
}: {
  entry: Publication;
  railLabel?: string | null;
}) {
  const links = [
    ...(entry.arxivId ? [{ label: `arXiv:${entry.arxivId}`, href: `https://arxiv.org/abs/${entry.arxivId}` }] : []),
    ...(entry.links ?? []),
  ];
  const displayedRail = railLabel === undefined ? entry.year : railLabel;

  return (
    <article className="entry" aria-labelledby={entry.id}>
      <div className="rail">{displayedRail}</div>
      <div className="body">
        <h3 className="title" id={entry.id}>
          {entry.url ? <a href={entry.url}>{entry.title}</a> : entry.title}
        </h3>
        <p className="authors">
          {entry.withAuthors
            ? <><span className="with">With</span> {entry.withAuthors}</>
            : entry.authors && highlightSelf(entry.authors)}
        </p>
        {entry.venue && <p className="venue">{entry.venue}</p>}
        {links.length > 0 && (
          <div className="links">
            {links.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
          </div>
        )}
      </div>
    </article>
  );
}
