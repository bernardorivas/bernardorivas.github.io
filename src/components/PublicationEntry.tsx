import type { Publication } from "@/data/types";
import { highlightSelf } from "@/lib/authors";

// One paper: year in the left rail, then title (linked to the paper itself),
// authors, venue-or-status, and the direct links. Entries in preparation have
// no year and no links — their venue line reads "In preparation."
export default function PublicationEntry({ entry }: { entry: Publication }) {
  const links = [
    ...(entry.arxivId ? [{ label: `arXiv:${entry.arxivId}`, href: `https://arxiv.org/abs/${entry.arxivId}` }] : []),
    ...(entry.links ?? []),
  ];
  return (
    <article className="entry" aria-labelledby={entry.id}>
      <div className="rail">{entry.year}</div>
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
