import { buildMetadata } from "@/lib/metadata";
import { talksCopy } from "@/data/copy";
import { talks } from "@/data/talks";
import type { Talk } from "@/data/types";
import TalkEntry from "@/components/TalkEntry";

// The rail names each group once: "Upcoming" for talks not yet given, as
// Research does with "Pending", and otherwise the year.
const railOf = (talk: Talk) => (talk.upcoming ? "Upcoming" : talk.year);

export const metadata = buildMetadata({
  title: "Talks — Bernardo Rivas",
  description:
    "Talks by Bernardo Rivas on computational dynamics, Conley theory, hybrid systems, and gene regulatory networks.",
  path: "/talks",
});

export default function Talks() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap page">
        <h1 className="page-title">{talksCopy.h1}</h1>
        <div className="entries">
          {talks.map((talk, index) => (
            <TalkEntry
              key={talk.id}
              talk={talk}
              railLabel={
                index === 0 || railOf(talk) !== railOf(talks[index - 1])
                  ? railOf(talk)
                  : null
              }
            />
          ))}
        </div>
      </div>
    </main>
  );
}
