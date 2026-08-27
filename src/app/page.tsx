import { buildMetadata } from "@/lib/metadata";
import { profile } from "@/data/profile";
import { homeCopy } from "@/data/copy";
import { recentPublications } from "@/data/publications";
import PublicationEntry from "@/components/PublicationEntry";

export const metadata = buildMetadata({
  title: "Bernardo Rivas",
  description:
    "Bernardo Rivas is a postdoctoral fellow in mathematics at the University of Toledo, working on nonlinear and hybrid dynamics.",
  path: "/",
  ogType: "profile",
});

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profile.jsonLd) }}
      />
      <div className="wrap page">
        {/* The portrait and contact row live in the persistent sidebar. */}
        <h1 className="page-title">{homeCopy.h1}</h1>
        {homeCopy.paragraphs.map((p) => (
          <p className="page-intro" key={p}>{p}</p>
        ))}

        <section aria-labelledby="recent-title">
          <h2 className="group-head" id="recent-title">{homeCopy.recentHeading}</h2>
          <div className="entries">
            {recentPublications.map((e) => (
              <PublicationEntry key={e.id} entry={e} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
