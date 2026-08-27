# React rebuild of bernardorivas academic site — design spec

Date: 2026-07-24
Status: approved (design); implementation plan to follow

## Context

The current site lives at `~/Work/Personal/website/`: 11 static HTML pages sharing
`style.css` and `site.js`, built with Vite 8 + `@cloudflare/vite-plugin`, deployed as a
Cloudflare Worker (via an OpenAI Sites hosting pipeline, project id in
`.openai/hosting.json`). It was originally generated with ChatGPT Sites; the full source
is local and under git (no remote). The owner wants the same site rebuilt in React to
learn React, with the current site staying live untouched until the rebuild is ready.

Decisions made during brainstorming:

- Framework: **Next.js** (App Router, TypeScript), full static export.
- Content: **data files** (typed TS modules), not markdown, not inline JSX.
- Visual design: **keep the current design** — pixel parity, not a redesign.
- Placement: **new folder `~/Work/Personal/website-react/`**, side by side; own git repo.

## Goals

1. A static-exported Next.js site whose rendered pages match the current site in
   content, structure, accessibility semantics, and appearance.
2. Content editable as data: adding a publication/talk/course touches one data file.
3. A codebase that teaches React: small single-purpose components, clear boundaries.

Non-goals: redesign, new features, CMS, blog, comments, analytics.

## Routes

| New route | Replaces |
|---|---|
| `/` | `index.html` |
| `/research` | `research.html` |
| `/publications` | `publications.html` |
| `/teaching` | `teaching.html` |
| `/teaching/calc-i` | `teaching-calc-i.html` |
| `/teaching/diffeq` | `teaching-diffeq.html` |
| `/teaching/math300` | `teaching-math300.html` |
| `/teaching/real-analysis` | `teaching-real-analysis.html` |
| `/lean` | `lean.html` |
| `/talks` | `talks.html` |
| 404 page | `404.html` |

- Redirects from every old `.html` path to the new route are added at deploy time
  (Cloudflare-side; static export cannot serve redirects itself).
- `files/**` (CV + all teaching PDFs) and `assets/**` images copy verbatim into
  `public/` — same URLs as today. Filenames are preserved byte-for-byte, including
  `files/teaching/math-reasoning/lectures/week4-day2+pigeonhole.pdf` (literal `+`;
  must not be percent-encoded or decoded as a space) and `week6-day1-4thofJuly.pdf`.
- Intentional gaps in file series are preserved (real-analysis workshops skip 04 and 06;
  math300 lectures have no week1-day1 or week2-day1).
- Generated `sitemap.xml` (10 pages, no 404) and `robots.txt`.

## Architecture

```
website-react/
  docs/specs/                  this spec
  public/
    files/...                  PDFs, verbatim copy
    assets/...                 images (profile.jpg, vanderpol-*, dsgrn, cmgdb, lean-lorenz-orbit, og-nonlinear-dynamics)
    og.png                     compressed social card (see Metadata)
  src/
    app/
      layout.tsx               html shell: fonts, theme bootstrap script, Nav, Footer, skip link
      page.tsx                 home
      research/page.tsx  publications/page.tsx  talks/page.tsx  lean/page.tsx
      teaching/page.tsx  teaching/{calc-i,diffeq,math300,real-analysis}/page.tsx
      not-found.tsx            404 (noindex)
      sitemap.ts  robots.ts
    components/
      Nav.tsx  Footer.tsx  ThemeToggle.tsx  SkipLink.tsx
      PublicationEntry.tsx  TalkEntry.tsx  CourseEntry.tsx
      ProjectCard.tsx  GatewayCard.tsx  LeanProject.tsx
      MaterialGroup.tsx  FileChip.tsx  SectionHead.tsx  Eyebrow.tsx
      LorenzCanvas.tsx         'use client'
    data/
      profile.ts               name, role, affiliation, links, JSON-LD fields
      publications.ts  talks.ts  courses.ts  projects.ts  lean-projects.ts
    styles/globals.css         ported style.css
    lib/metadata.ts            per-page title/description/OG helpers; site URL constant
```

All pages are server components (static). The only client components: `LorenzCanvas`,
`ThemeToggle`, and a small `FooterYear` (current-year injection). Everything else
renders to static HTML at build time.

## Data model

Every entry transcribed **verbatim** from the current HTML — text, punctuation
(middle dots `·` U+00B7, en dashes, curly quotes, accented names like Vitória/São
Carlos), and inline markup (`<em>` in venue names) preserved exactly.

- `publications.ts`: 8 entries in 3 groups (published & accepted / preprints / in
  preparation). Fields: `title`, `authors` (self-author marked), optional `venue`
  (may contain emphasis), optional `year`, `tag` (`L4DC` / `Preprint` / `In prep.`),
  optional `arxivId` + URL, stable `id` (existing ids like `pub-learned`,
  `prep-latent` kept for aria wiring). In-prep entries have no year and use a
  "With <collaborators>" author form. The 2024 preprint has no venue — all fields
  that are sometimes absent are optional in the type.
- `talks.ts`: 11 entries (7 invited, 4 contributed): `year`, `title`, `venue · location`
  string, stable `id`. Talks have **no** links — do not invent slide/abstract fields.
- `courses.ts`: teaching landing data — 4 institution/role groups (Toledo instructor;
  Rutgers instructor of record; Rutgers TA; ICMC–USP instructor), 12 course entries
  with optional `meta` line, optional materials links (internal course-page links and
  external Rutgers course-description URLs, distinct arrow glyphs `→` vs `↗`), some
  entries title-only. Plus per-course-page data: meta line, lede, material groups
  (each group: title, optional caption, render style `doclinks` vs `filegrid`,
  entries with **human-authored labels** — e.g. "3 · Direct proof & counterexample",
  "Practice problems — Midterm" — which are not derivable from filenames), and the
  SIRS evaluation stat ("4.5–4.9 / 5" + source sentence).
- `projects.ts`: 4 software projects; media is a union type: image (`dsgrn.png`,
  `cmgdb.png`) or text monogram (`L4DC`, `LATENT`); role tag Author vs Contributor.
- `lean-projects.ts`: 3 projects with optional status tag, code block (Lean source with
  Unicode `φ ℝ ⊆`, whitespace significant), figure, and gold trust-note (contains
  inline `<code>sorry</code>` and `<strong>`).
- `profile.ts`: name, role, affiliation, email `bernardo.dopradorivas@utoledo.edu`
  (the site's authoritative email), social links (Scholar `qN522F4AAAAJ`, ORCID
  `0009-0008-8603-0142`, GitHub `bernardorivas`, LinkedIn `bernardorivas-math`),
  hero copy, and the JSON-LD Person fields (alumniOf, knowsAbout, sameAs).

## Styling

`style.css` ports to `src/styles/globals.css` nearly verbatim; components reuse the
existing class names. Constraints the port must respect:

- The three-layer theme token system: `:root` light defaults,
  `@media (prefers-color-scheme: dark)`, and explicit `:root[data-theme="dark"]` /
  `:root[data-theme="light"]` overrides. All three layers kept so the manual toggle
  beats system preference in both directions.
- `color-mix()` used extensively — no build step may mangle it.
- Root font size is 18px (17px under 700px); the rem scale anchors to it.
- Body uses oldstyle numerals; `.meta`/mono elements force lining tabular numerals.
- Hardcoded `#fff` backgrounds on figure frames are intentional (figures on white in
  dark mode too) — do not "fix".
- `!important` on `.code-caption`/`.trust-note` font sizes fights `.lean-project > p`
  sizing — preserve.
- Print stylesheet (hides nav/footer/hero-actions/dynamics feature, black-on-white)
  and `prefers-reduced-motion` block carried over.
- Mobile `.entry .rail br { display:none }` depends on a literal `<br>` between year
  and venue tag in the markup — keep that `<br>` in the entry component.
- Known dead CSS may be dropped: `--panel-2` token (unused), `details/summary` rules
  (no page uses them; do not implement collapsibles).
- `--graph-hi` looks unused in CSS but keep the custom properties `--paper --line
  --graph --blue --gold` under their exact names: `LorenzCanvas` reads them at runtime.

## Behaviors

- **Theme**: inline **blocking** script in `<head>` (a raw `<script
  dangerouslySetInnerHTML>` in the root layout's head — deterministic under static
  export, unlike `next/script`) that reads
  localStorage `br-theme` and stamps `data-theme` on `<html>` before paint — the
  current `site.js` never reads storage on load; the inline script is the only
  flash-of-wrong-theme guard. `suppressHydrationWarning` on `<html>` so React does
  not clobber the attribute. `ThemeToggle` flips the attribute, persists to
  `br-theme` (try/catch), updates `meta[name=theme-color]` (`#14171c` dark /
  `#faf9f5` light), syncs `aria-pressed` and label ("Use dark theme"/"Use light
  theme"), and re-syncs on system-preference change only when no explicit theme set.
- **LorenzCanvas** (client): port of the existing simulation — RK4, σ=10 ρ=28 β=8/3,
  step 0.005, 24000 iterations keeping every 2nd point after i>1800, (x,z) window
  x∈[−21,21] z∈[0,52], 24×15 visited-cell grid, moving 620-point trail, gold head
  dot; palette read from CSS custom properties and re-read on `data-theme` mutation
  (MutationObserver); pause/resume button with `aria-pressed`; starts paused under
  `prefers-reduced-motion`; IntersectionObserver pauses off-screen; ResizeObserver
  redraws; devicePixelRatio capped at 2; RAF cancelled on pagehide.
- **Nav active state**: `aria-current="page"` set per route; the Teaching link is
  current on `/teaching` **and all `/teaching/*` subpages** (section-level); no
  `aria-current` anywhere on the 404 page. CSS keys off the attribute.
- **Footer year**: rendered as current year (client `FooterYear` with static
  fallback text "2026" for no-JS parity).
- **Accessibility wiring preserved**: skip link → `#main-content` with
  `tabindex="-1"`; every `section[aria-labelledby]` / heading-`id` pairing kept
  (including per-entry ids); `sr-only` headings; empty `aria-hidden` `.idx` spans on
  research themes (numbering comes from CSS).

## Metadata / SEO

- Per-page `metadata` exports reproduce current strings **verbatim**, including where
  `og:title` differs from `<title>` (e.g. "Calculus I — Workshop Materials" vs
  "Calculus I — Workshops — Bernardo Rivas") and which pages carry `og:image:alt`.
- `metadataBase` + per-page canonical replaces the current edge worker's
  HTMLRewriter (which rewrites canonical/og:url/og:image per request origin). The
  site URL lives in **one constant**; currently `https://bernardorivas.github.io`,
  swapped when the domain decision is made.
- Social image: the worker forces `<origin>/og.png` (2.3 MB) everywhere today. The
  rebuild uses one compressed `og.png` (target < 300 KB) as the site-wide OG/Twitter
  image, matching production behavior. Page-level `og-nonlinear-dynamics.png` is kept
  in `public/assets/` (JSON-LD/back-compat); orphaned `og-formalized-dynamics.png`
  is dropped (intentional normalization).
- JSON-LD Person schema on the home page, fields from `profile.ts`.
- Inline SVG data-URI favicon carried over exactly, defined once in the layout.
- 404: `noindex`, no OG tags, and (intentional normalization) the standard footer
  including LinkedIn.
- HTML entities in current sources (`&amp;`) decode to literal characters in JSX.

## Build & deploy

- `next.config.ts`: `output: 'export'`; no image optimization (plain `<img>` with
  explicit width/height, `loading="lazy"` where the current site has it).
- Deploy target: Cloudflare (Workers static assets or Pages), replacing the OpenAI
  Sites pipeline. Old-URL redirects (`/research.html → /research` etc.) configured
  Cloudflare-side. Deployment is a separate later step; the spec's deliverable is the
  static export serving correctly via `npx serve` locally.
- The existing `website/` folder is not modified at any point.

## Verification

1. **Content parity**: script extracts visible text and href sets per page from old
   and new HTML and diffs them (allowing the intentional normalizations listed above).
2. **Link check**: every internal href/src in the export resolves (catches the `+`
   filename and the skipped-number PDF series).
3. **Visual parity**: compare against the 26 reference screenshots in
   `website/.shots/` (light/dark × desktop/mobile per page).
4. **Behavior check**: theme toggle persists and wins over system preference both
   ways; no theme flash on reload; Lorenz pause button works; reduced-motion starts
   paused; print preview hides chrome.
5. `next build` passes with zero warnings that matter (typed data compiles).

## Risks / notes

- arXiv ids `2606.18501` / `2606.14925` look future-dated; they are transcribed
  verbatim, not "corrected".
- The `.shots/` baseline was captured from the old site; small anti-aliasing diffs are
  acceptable, structural/layout diffs are not.
- If Cloudflare Pages vs Workers matters for redirects, decide at deploy time; both
  support the needed path redirects.
