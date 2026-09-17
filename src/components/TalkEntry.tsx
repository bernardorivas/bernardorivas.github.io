import type { Talk } from "@/data/types";

// As on the publication lists, passing null leaves the rail blank.
export default function TalkEntry({
  talk,
  railLabel,
}: {
  talk: Talk;
  railLabel?: string | null;
}) {
  const displayedRail = railLabel === undefined ? talk.year : railLabel;

  return (
    <article className="entry" aria-labelledby={talk.id}>
      <div className="rail"><span className="yr">{displayedRail}</span></div>
      <div className="body">
        <h3 className="title" id={talk.id}>{talk.title}</h3>
        <p className="venue">{talk.venue}</p>
      </div>
    </article>
  );
}
