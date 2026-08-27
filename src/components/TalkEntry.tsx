import type { Talk } from "@/data/types";

// Markup mirrors $OLD/talks.html entries exactly. Unlike publications, the
// talks rail has no <br> — it's a single <span class="yr"> with nothing else
// (talks have no .vtag).
export default function TalkEntry({ talk }: { talk: Talk }) {
  return (
    <article className="entry" aria-labelledby={talk.id}>
      <div className="rail"><span className="yr">{talk.year}</span></div>
      <div className="body">
        <h3 className="title" id={talk.id}>{talk.title}</h3>
        <p className="venue">{talk.venue}</p>
      </div>
    </article>
  );
}
