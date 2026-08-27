import { buildMetadata } from "@/lib/metadata";
import { leanCopy } from "@/data/copy";
import { leanProjects } from "@/data/lean-projects";

export const metadata = buildMetadata({
  title: "Lean — Bernardo Rivas",
  description:
    "Lean 4 work by Bernardo Rivas on Conley index foundations, computer-assisted dynamics, and formalized analysis.",
  path: "/lean",
});

export default function Lean() {
  const { featured, experiments } = leanProjects;
  const [formalLorenz, graphLength] = experiments;

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap page">
        <h1 className="page-title">{leanCopy.h1}</h1>
        <p className="page-intro">{leanCopy.intro}</p>

        <section aria-labelledby="conley-lean-title">
          <h2 className="group-head" id="conley-lean-title">{featured.h2}</h2>
          <div className="lean-project">
            <p>{featured.paragraph1}</p>
            <p>{featured.paragraph2}</p>
            <pre className="lean-code" aria-label={featured.codeAriaLabel}><code>{featured.code}</code></pre>
            <p className="code-caption">{featured.codeCaption}</p>
          </div>
        </section>

        <section aria-labelledby="lean-experiments-title">
          <h2 className="group-head" id="lean-experiments-title">{leanCopy.otherExperimentsHeading}</h2>
          <div className="lean-projects">
            <article className="lean-project">
              <h3>{formalLorenz.title}</h3>
              <p>{formalLorenz.paragraph}</p>
              {formalLorenz.figure && (
                <figure className="lean-figure">
                  <img
                    src={formalLorenz.figure.src}
                    alt={formalLorenz.figure.alt}
                    width={formalLorenz.figure.width}
                    height={formalLorenz.figure.height}
                    loading="lazy"
                  />
                  <figcaption>{formalLorenz.figure.caption}</figcaption>
                </figure>
              )}
              {formalLorenz.trustNote && <p className="trust-note">{formalLorenz.trustNote}</p>}
            </article>

            <article className="lean-project">
              <h3>{graphLength.title}</h3>
              <p>{graphLength.paragraph}</p>
            </article>
          </div>
        </section>

        <p className="note">{leanCopy.teachingNote}</p>
      </div>
    </main>
  );
}
