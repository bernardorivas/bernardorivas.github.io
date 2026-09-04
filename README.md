# bernardorivas.github.io

Bernardo Rivas's academic site, built with Next.js (App Router) and statically
exported (`output: "export"`) — no server runtime; the result is a plain `out/`
directory of HTML/CSS/JS deployable to any static host.

The design rule is that every public page opens with its content: a short
paragraph at most, then a list whose entries link straight to the paper,
official course description, or repository. Lean and Hobbies are deliberately
unlisted drafts that remain available by direct URL.

## Structure

| Route | What it is |
| --- | --- |
| `/` | Photo, three sentences, email, and the three most recent papers |
| `/research` | One list of papers, preprints, and work in preparation |
| `/teaching` | Teaching experience by institution and role, with official course-description links where available |
| `/software` | Topological-dynamics introduction, Lorenz persistence animation, and research software |
| `/talks` | One reverse-chronological list |
| `/lean` | Draft/unlisted Lean 4 formalization work |

## Commands

```bash
npm run dev      # dev server at http://localhost:3000
npm run build    # static export to out/
npm test         # vitest unit tests
npm run lint     # eslint
npm run verify   # build + test + linkcheck + asset checks
```

To preview the static export as it will actually be served:

```bash
npm run build
npx serve out
```

## Content

All page content lives in `src/data/`, one file per content type, one entry per
item — edit data there rather than in the page components:

- `src/data/publications.tsx` — one editorially ordered list of papers;
  publication status lives on each entry. `recentPublications` is the
  landing-page subset.
- `src/data/talks.ts` — one list, newest first. Mathematics does not weight the
  invited/contributed distinction, so the site does not split on it.
- `src/data/courses.ts` — the teaching page's course groups
- `src/data/projects.ts` / `src/data/lean-projects.tsx` — software and Lean projects
- `src/data/profile.ts` — name, affiliation, and the contact links rendered as
  the icon row under the landing panel. ORCID is intentionally absent from that
  row but present in the JSON-LD `sameAs` block, so it stays machine-readable;
  re-adding it means one entry in `links` plus an icon in `src/components/icons.tsx`.
- `src/data/copy.tsx` — page prose not tied to a list
- `src/data/types.ts` — the TypeScript shapes the above conform to

Shared UI (nav, footer, entry rendering, theme toggle, contact icons) lives in
`src/components/`. Page routes live in `src/app/` (one `page.tsx` per route,
mirroring the URL structure). All styling is one file, `src/styles/globals.css`.

Route visibility lives in `src/data/routes.ts`. A `public` route can appear in
the primary navigation and sitemap; a `draft` route remains available by direct
URL but is omitted from both and receives `noindex` metadata. This is an
unlisted-draft mechanism, not access control. Change a route's status to
`public` when it is ready to be discoverable.

Unvetted teaching material is private and must remain outside this public
repository. `/public/files/teaching/` is ignored, the asset checks reject a
tracked teaching tree, and the export removes that path as defense in depth.

Icons are hand-authored inline SVG in `src/components/icons.tsx`, drawn in
`currentColor` so they inherit link colour and work in both themes. No icon
font, no CDN. The theme control sits at the top right of the nav on every page;
the footer carries only the copyright line.

Public assets (the CV, images, and social card) are under `public/`;
`scripts/check-assets.sh` checks their important invariants and verifies that
private teaching material has not entered the repository.

`public/files/cv.pdf` is a copy of `../curriculum-vitae/main-research.pdf`, which is
built from the `.tex` files in that folder and is the canonical academic CV (the
`base-2026/cv-research.pdf` in the job-materials folder is a copy of the same
build). Refresh it with `cp ../curriculum-vitae/main-research.pdf public/files/cv.pdf`
whenever the CV is rebuilt — it does not update itself, and a stale copy will
contradict the pages. The other variants (`main-teaching`, `main-europe`, `main`)
are for other audiences and are not what the site links to.

`public/assets/profile.jpg` is the current 880×1100 crop of
`../profile_pic.jpeg`. Preserve its 4:5 aspect ratio when replacing it.

## Deploy

- `npm run build` produces a static `out/` directory — no Node runtime needed
  at serve time. The workflow in `.github/workflows/publish.yaml` builds and
  deploys that directory to GitHub Pages after every push to `main`; it can
  also be run manually from the repository's Actions tab.
- **Old URLs.** `scripts/legacy-redirects.mjs` adds `noindex` compatibility
  pages for the previous Hugo and hand-written site addresses after every
  build. These are browser-level redirects because GitHub Pages cannot emit
  custom HTTP redirects. It also preserves the old CV and project-image paths
  as file aliases.
- **Site URL.** The canonical origin is the `SITE_URL` constant in
  `src/lib/metadata.ts` (used for canonical links, sitemap, and OG/Twitter
  image URLs) — update it if the deployed domain changes.
- `public/assets/og-nonlinear-dynamics.png` is unreferenced by any page but kept
  intentionally, for old-URL back-compat (external links/bookmarks pointing
  directly at that asset path); do not clean it up. `cmgdb.png` and `dsgrn.png`
  are likewise unreferenced since the software list dropped its thumbnails.

## Verification

`npm run verify` runs, in order:

1. `next build` — the static export must compile cleanly.
2. `npm test` (vitest) — unit tests for data/lib modules.
3. `scripts/legacy-redirects.mjs --check` — every compatibility page and file
   alias is present and points to the intended replacement.
4. `scripts/linkcheck.py` — every internal href/src in the export resolves to a
   real exported file.
5. `scripts/check-assets.sh` — public-asset checks and private-material guards.

All five must pass (exit 0) for `npm run verify` to succeed.

There was previously a fifth step, `scripts/parity.py`, which diffed visible
text and content links against the old hand-written site in `../website/`. That
contract was deliberately broken by the content rewrite, so the script has been
removed; `../website/` is now only a historical reference.

### What still needs a human

The scripts and unit tests cover data, links, and asset presence. They do not
drive a browser, so check these by hand in `npx serve out`:

- **Theme toggle**: flips light/dark, persists across reload with no flash of
  the wrong theme, and overrides system preference in both directions.
- **Keyboard skip-link**: pressing Tab on page load reveals "Skip to content".
- **Narrow viewports**: check 320–430 px in a real browser's device emulation;
  at ≤430 px the email occupies a full-width row below the portrait block.
