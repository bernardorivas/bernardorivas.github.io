import { buildMetadata } from "@/lib/metadata";
import { talksCopy } from "@/data/copy";
import { talks } from "@/data/talks";
import TalkEntry from "@/components/TalkEntry";

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
          {talks.map((talk) => (
            <TalkEntry key={talk.id} talk={talk} />
          ))}
        </div>
      </div>
    </main>
  );
}
