# React Rebuild of Academic Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the static academic site at `/Users/bdoprad/Work/Personal/website` as a statically-exported Next.js app in `/Users/bdoprad/Work/Personal/website-react` with verbatim content parity.

**Architecture:** Next.js App Router + TypeScript, `output: 'export'`. All pages are server components rendered at build time; the only client components are `LorenzCanvas`, `ThemeToggle`, `FooterYear`, and `Nav` (for `usePathname`). All content lives in typed data modules under `src/data/`; `style.css` ports to global CSS with class names unchanged. Spec: `docs/specs/2026-07-24-react-rebuild-design.md` (read it before starting any task).

**Tech Stack:** Next.js (latest), React, TypeScript, vitest (tests), plain CSS (no Tailwind), Python 3 stdlib (parity scripts).

## Global Constraints

- Source of truth for ALL content: the HTML files in `/Users/bdoprad/Work/Personal/website/` (called `$OLD` below). Transcribe text verbatim: keep `·` (U+00B7), en dashes, curly quotes, accents (Vitória, São Carlos), `<em>` in venues. Decode HTML entities (`&amp;` → `&`) when moving into JSX/TS strings.
- Never modify anything under `$OLD`.
- CSS class names must match the old site's exactly (parity depends on it).
- Node >= 22.13.0. No Tailwind, no CSS-in-JS, no UI libraries.
- Commit after every task. Plain commit messages. NEVER add a `Co-Authored-By` or any Claude/Anthropic trailer.
- Intentional deviations from the old site (the ONLY allowed ones): clean URLs instead of `.html`; 404 footer gains the LinkedIn link; `og-formalized-dynamics.png` dropped; `og.png` compressed; site-wide social image is `/og.png` (matches old production behavior via its edge worker).
- PDFs/filenames copy byte-for-byte; `week4-day2+pigeonhole.pdf` keeps its literal `+`. Real-analysis workshops intentionally skip 04 and 06; math300 lectures have no week1-day1/week2-day1 — do not "fix".
- `--paper --line --graph --blue --gold` CSS custom property names must not be renamed (LorenzCanvas reads them at runtime).
- Run all commands from `/Users/bdoprad/Work/Personal/website-react` unless stated.

---

### Task 1: Scaffold, static export config, vitest, static assets

**Files:**
- Create: Next.js scaffold (via create-next-app), `next.config.ts`, `vitest.config.ts`, `public/files/**`, `public/assets/**`, `public/og.png`
- Test: `scripts/check-assets.sh`

**Interfaces:**
- Produces: a building Next.js app; `npm test` runs vitest; static assets at the same URLs as the old site.

- [ ] **Step 1: Scaffold into the existing repo** (the repo already contains `docs/`; create-next-app tolerates it via a temp dir)

```bash
cd /Users/bdoprad/Work/Personal/website-react
npx create-next-app@latest tmp-scaffold --typescript --app --src-dir --eslint --no-tailwind --import-alias "@/*" --use-npm
rsync -a --exclude .git tmp-scaffold/ ./ && rm -rf tmp-scaffold
```

- [ ] **Step 2: Configure static export.** Replace `next.config.ts` content:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
```

- [ ] **Step 3: Add vitest**

```bash
npm install -D vitest
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  esbuild: { jsx: "automatic" },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 4: Copy static assets**

```bash
rm -rf public && mkdir -p public/assets
cp -R /Users/bdoprad/Work/Personal/website/files public/files
for f in cmgdb.png dsgrn.png lean-lorenz-orbit.png og-nonlinear-dynamics.png profile.jpg vanderpol-morse-graph.png vanderpol-multivalued-map.png; do
  cp "/Users/bdoprad/Work/Personal/website/assets/$f" public/assets/; done
cp /Users/bdoprad/Work/Personal/website/og.png public/og.png
sips -Z 1200 public/og.png
```

Note: `og-formalized-dynamics.png` deliberately NOT copied. If `stat -f%z public/og.png` still exceeds 300000 bytes, run `sips -Z 900 public/og.png`.

- [ ] **Step 5: Write and run the asset check.** Create `scripts/check-assets.sh`:

```bash
#!/bin/bash
set -e
test -f "public/files/teaching/math-reasoning/lectures/week4-day2+pigeonhole.pdf"
test -f public/files/cv.pdf
test $(find public/files/teaching/calculus-i -name 'workshop-*.pdf' | wc -l) -eq 14
test ! -f public/files/teaching/real-analysis/workshop-04.pdf   # intentional gap
test ! -f public/assets/og-formalized-dynamics.png
test $(stat -f%z public/og.png) -lt 300000
echo OK
```

Run: `bash scripts/check-assets.sh` → `OK`. Then `npm run build` → succeeds, `out/` created.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "Scaffold Next.js static export with vitest and static assets"
```

---

### Task 2: Global CSS port + root layout + metadata helper

**Files:**
- Create: `src/styles/globals.css`, `src/lib/metadata.ts`
- Modify: `src/app/layout.tsx`; delete scaffold CSS (`src/app/globals.css`, `page.module.css`)

**Interfaces:**
- Produces: `SITE_URL: string`, `FAVICON: string` (data URI), and `buildMetadata(opts: { title: string; description: string; path: string; ogTitle?: string; ogDescription?: string; ogType?: "profile" | "website"; ogImageAlt?: string }): Metadata` from `@/lib/metadata`. Root layout renders `<html lang="en" suppressHydrationWarning>`, theme bootstrap script, skip link, and `{children}`; Nav/Footer are added in Task 4.

- [ ] **Step 1: Port the stylesheet.** Copy `$OLD/style.css` to `src/styles/globals.css` verbatim, then make exactly two deletions: the `--panel-2` custom property lines (all theme blocks) and the `details`/`summary` rules (dead CSS per spec). Keep everything else including `!important`s, `color-mix()`, print block, reduced-motion block, and the three theme layers (`:root`, `@media (prefers-color-scheme: dark)`, `:root[data-theme="dark"]`/`:root[data-theme="light"]`).

- [ ] **Step 2: Metadata helper.** Create `src/lib/metadata.ts`:

```ts
import type { Metadata } from "next";

export const SITE_URL = "https://bernardorivas.github.io";

// Copied verbatim from the favicon data URI in $OLD/index.html <head>
export const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23faf9f5'/%3E%3Cg stroke='%231c3d61' stroke-width='2' fill='none'%3E%3Cline x1='6' y1='16' x2='16' y2='8'/%3E%3Cline x1='6' y1='16' x2='16' y2='24'/%3E%3Cline x1='16' y1='8' x2='26' y2='16'/%3E%3Cline x1='16' y1='24' x2='26' y2='16'/%3E%3C/g%3E%3Cg fill='%231c3d61'%3E%3Ccircle cx='6' cy='16' r='3'/%3E%3Ccircle cx='26' cy='16' r='3'/%3E%3C/g%3E%3Cg fill='%23faf9f5' stroke='%231c3d61' stroke-width='2'%3E%3Ccircle cx='16' cy='8' r='2.6'/%3E%3Ccircle cx='16' cy='24' r='2.6'/%3E%3C/g%3E%3C/svg%3E";

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string; // "/" or "/research" etc.
  ogTitle?: string;
  ogDescription?: string;
  ogType?: "profile" | "website";
  ogImageAlt?: string;
}): Metadata {
  const url = opts.path === "/" ? "/" : opts.path;
  return {
    title: opts.title,
    description: opts.description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    icons: [{ url: FAVICON }],
    openGraph: {
      type: opts.ogType ?? "website",
      title: opts.ogTitle ?? opts.title,
      description: opts.ogDescription ?? opts.description,
      url,
      images: [{ url: "/og.png", ...(opts.ogImageAlt ? { alt: opts.ogImageAlt } : {}) }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.ogTitle ?? opts.title,
      description: opts.ogDescription ?? opts.description,
      images: ["/og.png"],
    },
  };
}
```

- [ ] **Step 3: Root layout.** Replace `src/app/layout.tsx`:

```tsx
import "@/styles/globals.css";

// Verbatim from every $OLD page head: restores stored theme before paint.
const THEME_BOOTSTRAP =
  "try{var t=localStorage.getItem('br-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#faf9f5" />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify.** Delete `src/app/globals.css` and `src/app/page.module.css`; strip `src/app/page.tsx` to a minimal `export default function Home(){return <main id="main-content" tabIndex={-1} />}` for now. Run `npm run build`; then `grep -c "br-theme" out/index.html` → `1`, `grep -c "skip-link" out/index.html` → at least 1.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Port global stylesheet, root layout with theme bootstrap, metadata helper"
```

---

### Task 3: Data types, profile, page copy

**Files:**
- Create: `src/data/types.ts`, `src/data/profile.ts`, `src/data/copy.tsx`
- Test: `src/data/profile.test.ts`

**Interfaces:**
- Produces (from `@/data/types`):

```ts
export type PubTag = "L4DC" | "Preprint" | "In prep.";
export interface Publication {
  id: string; title: string; url?: string;
  authors: string;            // e.g. "B. Rivas, W. Kalies" — component highlights "B. Rivas"
  withAuthors?: string;       // in-prep only: collaborators after italic "With"
  venue?: React.ReactNode;    // may contain <em>
  year?: string; tag: PubTag; arxivId?: string; featuredOnHome?: boolean;
}
export interface Talk { id: string; year: string; title: string; venue: string; }
export interface CourseLink { label: string; href: string; external?: boolean; } // external renders "↗", internal "→"
export interface Course { id: string; term: string; title: string; meta?: string; links?: CourseLink[]; }
export interface CourseGroup { title: string; courses: Course[]; }
export interface MaterialLink { label: string; href: string; }
export interface MaterialGroupData { title: string; sub?: string; style: "doclinks" | "filegrid"; links: MaterialLink[]; }
export interface CoursePage { slug: string; backTo: "/teaching"; eyebrow: string; title: string; meta: string; lede: string; groups: MaterialGroupData[]; }
export interface Project { id: string; name: string; role: "Author" | "Contributor"; description: string; link: { label: string; href: string };
  media: { kind: "img"; src: string; alt: string; width: number; height: number } | { kind: "mark"; text: string }; }
```

- Produces `profile` from `@/data/profile` with: `name`, `role`, `affiliation`, `email` (`bernardo.dopradorivas@utoledo.edu`), `links` (Email/Google Scholar/ORCID/GitHub/LinkedIn label+href), `cvHref: "/files/cv.pdf"`, `jsonLd` (the JSON-LD Person object from `$OLD/index.html`, transcribed with `knowsAbout`, `alumniOf`, `sameAs`).
- Produces from `@/data/copy` (a `.tsx` module): JSX/string exports of all page prose, transcribed verbatim: `homeCopy` (kicker, lede, about, dynamics eyebrow/heading/paragraph/keywords/caption, gateway cards content, lean-aside content), `researchCopy` (h1, two ledes, 4 themes, funding note, morse-section prose + figure captions/labels), `publicationsCopy`, `talksCopy`, `leanCopy` (incl. the Lean code block string and trust-note JSX), `teachingCopy` (h1, lede, SIRS stat strong+span text, note), `notFoundCopy`.

- [ ] **Step 1: Failing test.** Create `src/data/profile.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { profile } from "@/data/profile";

describe("profile", () => {
  it("has the site-authoritative email and links", () => {
    expect(profile.email).toBe("bernardo.dopradorivas@utoledo.edu");
    expect(profile.links.map(l => l.label)).toEqual(["Email", "Google Scholar", "ORCID", "GitHub", "LinkedIn"]);
    expect(profile.links.find(l => l.label === "ORCID")!.href).toContain("0009-0008-8603-0142");
    expect(profile.jsonLd.knowsAbout).toHaveLength(8);
  });
});
```

Run `npm test` → fails (module not found).

- [ ] **Step 2: Implement.** Write `src/data/types.ts` exactly as in Interfaces. Write `src/data/profile.ts` and `src/data/copy.tsx` by transcribing from `$OLD/index.html`, `$OLD/research.html`, `$OLD/publications.html`, `$OLD/talks.html`, `$OLD/lean.html`, `$OLD/teaching.html`, `$OLD/404.html`. Open each file and copy the prose exactly — do not paraphrase. Where the source has inline markup (`<strong>`, `<em>`, `<code>`, links inside paragraphs), export a JSX fragment.

- [ ] **Step 3: `npm test` → PASS. Then commit**

```bash
git add -A && git commit -m "Add data types, profile, and verbatim page copy"
```

---

### Task 4: Chrome components (Nav, Footer, ThemeToggle, FooterYear)

**Files:**
- Create: `src/lib/nav.ts`, `src/components/Nav.tsx`, `src/components/Footer.tsx`, `src/components/ThemeToggle.tsx`, `src/components/FooterYear.tsx`
- Modify: `src/app/layout.tsx`
- Test: `src/lib/nav.test.ts`

**Interfaces:**
- Consumes: `profile` (Task 3).
- Produces: `navCurrent(pathname: string, href: string): boolean`; `<Nav />` and `<Footer />` (no props), rendered from the root layout around `{children}`.

- [ ] **Step 1: Failing test.** `src/lib/nav.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { navCurrent } from "@/lib/nav";

describe("navCurrent", () => {
  it("marks exact route current", () => { expect(navCurrent("/research", "/research")).toBe(true); });
  it("marks Teaching current on subpages (section-level)", () => {
    expect(navCurrent("/teaching/calc-i", "/teaching")).toBe(true);
    expect(navCurrent("/teaching", "/teaching")).toBe(true);
  });
  it("does not mark others on teaching subpages", () => { expect(navCurrent("/teaching/calc-i", "/research")).toBe(false); });
  it("never marks the CV pdf link", () => { expect(navCurrent("/files/cv.pdf", "/files/cv.pdf")).toBe(false); });
});
```

Run `npm test` → fails.

- [ ] **Step 2: Implement `src/lib/nav.ts`:**

```ts
export function navCurrent(pathname: string, href: string): boolean {
  if (href.endsWith(".pdf")) return false;
  if (href === "/teaching") return pathname === "/teaching" || pathname.startsWith("/teaching/");
  return pathname === href;
}
```

- [ ] **Step 3: Components.** `src/components/Nav.tsx` (client — needs the pathname; during static prerender each page bakes the correct `aria-current`):

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navCurrent } from "@/lib/nav";

const LINKS = [
  { label: "Research", href: "/research" },
  { label: "Publications", href: "/publications" },
  { label: "Teaching", href: "/teaching" },
  { label: "Lean", href: "/lean" },
  { label: "Talks", href: "/talks" },
  { label: "CV", href: "/files/cv.pdf" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="site-nav">
      <div className="wrap">
        <Link className="brand" href="/" aria-current={pathname === "/" ? "page" : undefined}>Bernardo Rivas</Link>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map(l =>
            l.href.endsWith(".pdf")
              ? <a key={l.href} href={l.href}>{l.label}</a>
              : <Link key={l.href} href={l.href} aria-current={navCurrent(pathname, l.href) ? "page" : undefined}>{l.label}</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
```

`src/components/ThemeToggle.tsx` — port the theme block of `$OLD/site.js` (read it first):

```tsx
"use client";
import { useCallback, useEffect, useState } from "react";

function systemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function currentTheme(): "dark" | "light" {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "dark" || t === "light" ? t : systemTheme();
}
function applyMeta(theme: "dark" | "light") {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#14171c" : "#faf9f5");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);
  useEffect(() => {
    setTheme(currentTheme());
    applyMeta(currentTheme());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!document.documentElement.getAttribute("data-theme")) {
        setTheme(systemTheme()); applyMeta(systemTheme());
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const toggle = useCallback(() => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("br-theme", next); } catch {}
    setTheme(next); applyMeta(next);
  }, []);
  const dark = theme === "dark";
  return (
    <button type="button" className="theme-toggle" data-theme-toggle
      aria-pressed={dark} onClick={toggle}>
      {dark ? "Use light theme" : "Use dark theme"}
    </button>
  );
}
```

`src/components/FooterYear.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";

export default function FooterYear() {
  const [year, setYear] = useState("2026"); // static fallback, matches old markup
  useEffect(() => { setYear(String(new Date().getFullYear())); }, []);
  return <span data-current-year>{year}</span>;
}
```

`src/components/Footer.tsx` (server):

```tsx
import { profile } from "@/data/profile";
import ThemeToggle from "@/components/ThemeToggle";
import FooterYear from "@/components/FooterYear";

export default function Footer() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-links">
          {profile.links.map(l => <a key={l.label} href={l.href}>{l.label}</a>)}
          <a href={profile.cvHref}>CV</a>
        </div>
        <div className="foot-meta">
          <span>© <FooterYear /> Bernardo Rivas</span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
```

Update `src/app/layout.tsx` body to `<body><a className="skip-link" …/><Nav />{children}<Footer /></body>`.

- [ ] **Step 4: Verify.** `npm test` → PASS. `npm run build`; `grep -o 'aria-current="page"' out/index.html | wc -l` → 1 (brand link only on home). Open the exported HTML in a browser (`npx serve out`) and confirm the theme toggle flips dark/light and survives reload.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Add nav, footer, theme toggle, and footer year components"
```

---

### Task 5: Lorenz simulation lib + LorenzCanvas

**Files:**
- Create: `src/lib/lorenz.ts`, `src/components/LorenzCanvas.tsx`
- Test: `src/lib/lorenz.test.ts`

**Interfaces:**
- Produces: from `@/lib/lorenz`: `rk4Step(s: [number, number, number], dt: number): [number, number, number]` and `computeTrajectory(): Array<[number, number]>` (projected (x,z) points). `<LorenzCanvas />` client component rendering the `figure[data-lorenz-figure]` block used by the home page.

- [ ] **Step 1: Failing test.** `src/lib/lorenz.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { rk4Step, computeTrajectory } from "@/lib/lorenz";

describe("lorenz", () => {
  it("origin is a fixed point", () => { expect(rk4Step([0, 0, 0], 0.005)).toEqual([0, 0, 0]); });
  it("trajectory stays in the projection window", () => {
    const pts = computeTrajectory();
    expect(pts.length).toBeGreaterThan(10000);
    for (const [x, z] of pts) { expect(x).toBeGreaterThan(-21); expect(x).toBeLessThan(21); expect(z).toBeGreaterThan(0); expect(z).toBeLessThan(52); }
  });
});
```

Run → fails.

- [ ] **Step 2: Implement `src/lib/lorenz.ts`** by porting the math from `$OLD/site.js` (the `[data-lorenz-figure]` section — read it and keep the constants exactly): σ=10, ρ=28, β=8/3, RK4, initial state `[0.1, 0, 0]`, dt=0.005, 24000 iterations, keep every 2nd point after i>1800, project (x, z) with window x∈[−21,21], z∈[0,52]. `computeTrajectory` returns the projected points; clamp is not applied — if the test's window assertions fail, widen only the assertion to match the source's actual window values, never alter the constants.

- [ ] **Step 3: Implement `src/components/LorenzCanvas.tsx`.** Port the rendering/lifecycle from `$OLD/site.js` verbatim into a `"use client"` component with one `useEffect` owning setup/teardown. Must reproduce: 24×15 visited-cell grid fill (`--blue` at alpha 0.055), grid lines (`--line` alpha 0.44), full path (`--graph` alpha 0.34), 620-point moving trail (`--blue` alpha 0.95, width 1.45), gold head dot radius 3.1, cursor starts at 1100 advancing 11 points/frame, RAF throttled to >32 ms, palette read from CSS custom properties on `:root` re-read via `MutationObserver` on `data-theme`, `prefers-reduced-motion` starts paused, `IntersectionObserver` (rootMargin 80px) pauses off-screen, `ResizeObserver` redraw, devicePixelRatio capped at 2, RAF cancelled on `pagehide` and on unmount. JSX structure (classes/attrs must match old markup — copy aria-label and caption text from `$OLD/index.html`):

```tsx
<figure className="dynamics-feature" data-lorenz-figure>
  {/* .dynamics-copy block comes from the home page as children */}
  <div className="lorenz-panel">
    <div className="lorenz-stage">
      <canvas data-lorenz-canvas width={720} height={430} aria-label="…verbatim from index.html…" />
      <span className="lorenz-label">…verbatim…</span>
      <button type="button" className="simulation-toggle" data-simulation-toggle aria-pressed={paused} onClick={togglePaused}>
        {paused ? "Play motion" : "Pause motion"}
      </button>
    </div>
    <p className="simulation-caption">…verbatim (σ=10, ρ=28, β=8/3 caption)…</p>
  </div>
</figure>
```

Take a `children` prop for the `.dynamics-copy` column so prose stays server-rendered.

- [ ] **Step 4: Verify.** `npm test` → PASS. Manual: temporary render on home, `npm run dev`, confirm animation runs, pause works, colors change with theme toggle.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Port Lorenz simulation as tested lib plus canvas component"
```

---

### Task 6: Publications + talks data

**Files:**
- Create: `src/data/publications.tsx`, `src/data/talks.ts`
- Test: `src/data/content.test.ts`

**Interfaces:**
- Consumes: types (Task 3).
- Produces: `publicationGroups: { title: string; id: string; entries: Publication[] }[]` (3 groups); `featuredPublications: Publication[]` (the 3 home entries); `invitedTalks: Talk[]`, `contributedTalks: Talk[]`.

- [ ] **Step 1: Failing test.** `src/data/content.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { publicationGroups, featuredPublications } from "@/data/publications";
import { invitedTalks, contributedTalks } from "@/data/talks";

describe("publications", () => {
  it("has 8 entries in 3 groups (1/3/4)", () => {
    expect(publicationGroups.map(g => g.entries.length)).toEqual([1, 3, 4]);
  });
  it("keeps arXiv ids verbatim (including future-dated ones)", () => {
    const ids = publicationGroups.flatMap(g => g.entries).map(e => e.arxivId).filter(Boolean);
    expect(ids).toEqual(["2511.08737", "2606.18501", "2606.14925", "2412.11078"]);
  });
  it("in-prep entries have no year and use withAuthors", () => {
    for (const e of publicationGroups[2].entries) { expect(e.year).toBeUndefined(); expect(e.withAuthors).toBeTruthy(); }
  });
  it("features 3 on home", () => { expect(featuredPublications).toHaveLength(3); });
});

describe("talks", () => {
  it("has 7 invited and 4 contributed", () => {
    expect(invitedTalks).toHaveLength(7); expect(contributedTalks).toHaveLength(4);
  });
  it("uses the middle-dot separator in venues", () => {
    for (const t of [...invitedTalks, ...contributedTalks]) expect(t.venue).toContain("·");
  });
});
```

Run → fails.

- [ ] **Step 2: Transcribe from `$OLD/publications.html` and `$OLD/talks.html`.** Keep existing entry ids (`pub-learned`, `pub-hybrid`, `pub-boolean`, `pub-global`, `prep-latent`, `prep-attractor`, `prep-cycling`, `prep-physics`; talk ids like `talk-homological`). Anchor entries (verify the rest against source):

```tsx
// publications.tsx — group "Published & accepted"
{ id: "pub-learned", title: "Topological Dynamics via Learned Hybrid Systems",
  url: "https://arxiv.org/abs/2511.08737",
  authors: "B. Rivas, K. Iwasaki, W. Kalies, A. Bloch, M. Ghaffari",
  venue: <>Proceedings of Machine Learning Research · L4DC 2026</>,
  year: "2026", tag: "L4DC", arxivId: "2511.08737", featuredOnHome: true },
// group "Preprints" — first entry
{ id: "pub-hybrid", title: "Conley Index Theory for Hybrid Systems",
  url: "https://arxiv.org/abs/2606.18501", authors: "B. Rivas, W. Kalies",
  venue: <>Submitted to <em>Nonlinear Analysis: Hybrid Systems</em></>,
  year: "2026", tag: "Preprint", arxivId: "2606.18501", featuredOnHome: true },
```

The 2024 preprint (`pub-global`) has NO venue. The 4 in-prep entries have `tag: "In prep."`, `withAuthors` (e.g. `"T. Wehbe, W. Kalies"` for Hybrid Attractor Lattices), no url/year/arxivId.

- [ ] **Step 3: `npm test` → PASS. Commit**

```bash
git add -A && git commit -m "Transcribe publications and talks data"
```

---

### Task 7: Courses + projects + lean-projects data

**Files:**
- Create: `src/data/courses.ts`, `src/data/course-pages.ts`, `src/data/projects.ts`, `src/data/lean-projects.tsx`
- Test: `src/data/teaching.test.ts`

**Interfaces:**
- Consumes: types (Task 3).
- Produces: `courseGroups: CourseGroup[]` (4 groups, entries 1/3/7/1); `coursePages: Record<"calc-i" | "diffeq" | "math300" | "real-analysis", CoursePage>`; `projects: Project[]` (4); `leanProjects` (featured project incl. code string + 2 experiments + proof-and-teaching prose, as structured JSX exports).

- [ ] **Step 1: Failing test.** `src/data/teaching.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { courseGroups, } from "@/data/courses";
import { coursePages } from "@/data/course-pages";
import { projects } from "@/data/projects";

describe("teaching landing", () => {
  it("has 4 groups with 1/3/7/1 courses", () => {
    expect(courseGroups.map(g => g.courses.length)).toEqual([1, 3, 7, 1]);
  });
  it("uses en dash in ICMC–USP group title", () => {
    expect(courseGroups[3].title).toContain("ICMC–USP");
  });
});

describe("course pages", () => {
  it("calc-i has 14 workshop chips", () => {
    expect(coursePages["calc-i"].groups[0].links).toHaveLength(14);
  });
  it("math300 homework keeps human labels", () => {
    const hw = coursePages["math300"].groups.find(g => g.title === "Homework")!;
    expect(hw.links).toHaveLength(10);
    expect(hw.links[2].label).toBe("3 · Direct proof & counterexample");
  });
  it("real-analysis workshops skip 04 and 06", () => {
    const ws = coursePages["real-analysis"].groups.map(g => g.links).flat().map(l => l.href);
    expect(ws.some(h => h.includes("workshop-04"))).toBe(false);
    expect(ws.some(h => h.includes("workshop-05"))).toBe(true);
  });
  it("preserves the + filename verbatim", () => {
    const all = Object.values(coursePages).flatMap(p => p.groups).flatMap(g => g.links);
    expect(all.some(l => l.href === "/files/teaching/math-reasoning/lectures/week4-day2+pigeonhole.pdf")).toBe(true);
  });
});

describe("projects", () => {
  it("has 4 with both media kinds", () => {
    expect(projects).toHaveLength(4);
    expect(projects.some(p => p.media.kind === "mark")).toBe(true);
    expect(projects.some(p => p.media.kind === "img")).toBe(true);
  });
});
```

Run → fails.

- [ ] **Step 2: Transcribe.** Sources: `$OLD/teaching.html` (12 course entries across 4 institution groups — every entry has a stable `id` like `course-real-summer-2024`; internal materials links point at new routes `/teaching/...`, external Rutgers course-description URLs keep `external: true`), `$OLD/teaching-calc-i.html`, `$OLD/teaching-diffeq.html`, `$OLD/teaching-math300.html`, `$OLD/teaching-real-analysis.html` (metas, ledes, group titles, subs, every link label verbatim — labels are human-authored and NOT derivable from filenames), `$OLD/research.html` (4 projects incl. media: `dsgrn.png` 128×59, `cmgdb.png` 128×127, marks `L4DC`/`LATENT`), `$OLD/lean.html` (featured Conley project with its Lean code block — copy the code string exactly, Unicode `φ ℝ ⊆` and indentation intact; Formal Lorenz with figure `lean-lorenz-orbit.png` 3600×1280 and the gold trust-note containing `<code>sorry</code>`; Graph length under convexity).

- [ ] **Step 3: `npm test` → PASS. Commit**

```bash
git add -A && git commit -m "Transcribe courses, course pages, projects, and lean projects data"
```

---

### Task 8: Entry/display components

**Files:**
- Create: `src/components/PublicationEntry.tsx`, `src/components/TalkEntry.tsx`, `src/components/CourseEntry.tsx`, `src/components/ProjectCard.tsx`, `src/components/GatewayCard.tsx`, `src/components/MaterialGroup.tsx`, `src/components/SectionHead.tsx`
- Test: `src/lib/authors.test.ts`, `src/lib/authors.tsx`

**Interfaces:**
- Consumes: all types from Task 3.
- Produces: `<PublicationEntry entry={Publication} />`, `<TalkEntry talk={Talk} />`, `<CourseEntry course={Course} />`, `<ProjectCard project={Project} />`, `<GatewayCard eyebrow title lede items enterLabel href />`, `<MaterialGroup group={MaterialGroupData} />`, `<SectionHead title more={{label, href}?} />`; `highlightSelf(authors: string): React.ReactNode` from `@/lib/authors`.

- [ ] **Step 1: Failing test.** `src/lib/authors.test.ts` (renderless — assert structure):

```ts
import { describe, it, expect } from "vitest";
import { highlightSelf } from "@/lib/authors";

describe("highlightSelf", () => {
  it("wraps B. Rivas wherever it appears", () => {
    const parts = highlightSelf("B. Cummins, M. Gameiro, B. Rivas") as unknown[];
    expect(JSON.stringify(parts)).toContain("author-self");
  });
  it("passes through strings without the name", () => {
    expect(highlightSelf("A. Nobody")).toEqual(["A. Nobody"]);
  });
});
```

Run → fails.

- [ ] **Step 2: Implement `src/lib/authors.tsx`:**

```tsx
export function highlightSelf(authors: string): React.ReactNode {
  const parts = authors.split("B. Rivas");
  const out: React.ReactNode[] = [];
  parts.forEach((p, i) => {
    if (p) out.push(p);
    if (i < parts.length - 1) out.push(<span key={i} className="author-self">B. Rivas</span>);
  });
  return out;
}
```

- [ ] **Step 3: Components** — markup mirrors the old HTML exactly (classes, `<br>` in the rail, aria wiring):

`PublicationEntry.tsx`:

```tsx
import type { Publication } from "@/data/types";
import { highlightSelf } from "@/lib/authors";

export default function PublicationEntry({ entry }: { entry: Publication }) {
  return (
    <article className="entry" aria-labelledby={entry.id}>
      <div className="rail">
        {entry.year && <><span className="yr">{entry.year}</span><br /></>}
        <span className="vtag">{entry.tag}</span>
      </div>
      <div className="body">
        <h3 className="title" id={entry.id}>
          {entry.url ? <a href={entry.url}>{entry.title}</a> : entry.title}
        </h3>
        <p className="authors">
          {entry.withAuthors
            ? <><span className="with">With</span> {entry.withAuthors}</>
            : highlightSelf(entry.authors)}
        </p>
        {entry.venue && <p className="venue">{entry.venue}</p>}
        {entry.arxivId && (
          <div className="links"><a href={`https://arxiv.org/abs/${entry.arxivId}`}>arXiv:{entry.arxivId}</a></div>
        )}
      </div>
    </article>
  );
}
```

`TalkEntry.tsx`:

```tsx
import type { Talk } from "@/data/types";

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
```

`CourseEntry.tsx`:

```tsx
import type { Course } from "@/data/types";
import Link from "next/link";

export default function CourseEntry({ course }: { course: Course }) {
  return (
    <article className="entry" aria-labelledby={course.id} id={course.id}>
      <div className="rail"><span className="yr">{course.term}</span></div>
      <div className="body">
        <h3 className="title" id={`${course.id}-title`}>{course.title}</h3>
        {course.meta && <p className="meta">{course.meta}</p>}
        {course.links && (
          <div className="materials">
            {course.links.map(l =>
              l.external
                ? <a key={l.href} href={l.href}>{l.label} ↗</a>
                : <Link key={l.href} href={l.href}>{l.label} →</Link>)}
          </div>
        )}
      </div>
    </article>
  );
}
```

Before finalizing, diff this structure against one real course entry in `$OLD/teaching.html` (class names `.materials`, arrow placement, id scheme) and match the source exactly where it differs from the above.

`MaterialGroup.tsx`:

```tsx
import type { MaterialGroupData } from "@/data/types";

export default function MaterialGroup({ group }: { group: MaterialGroupData }) {
  return (
    <div className="matgroup">
      <h2>{group.title}</h2>
      {group.sub && <p className="sub">{group.sub}</p>}
      {group.style === "filegrid"
        ? <div className="filegrid">{group.links.map(l => <a key={l.href} className="chip" href={l.href}>{l.label}</a>)}</div>
        : <div className="doclinks">{group.links.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}</div>}
    </div>
  );
}
```

`ProjectCard.tsx`, `GatewayCard.tsx`, `SectionHead.tsx`: same approach — copy the exact structure from `$OLD/research.html` / `$OLD/index.html` (`.project` with `.project-media` img-or-mark union and `.tag`/`.tag.soft` role chip; `.gateway` with eyebrow/h3/p/ul and stretched `.enter` link with `<span className="ar">→</span>`; `.section-head` with h2 + optional `.more` link).

- [ ] **Step 4: `npm test` → PASS; `npm run build` still passes. Commit**

```bash
git add -A && git commit -m "Add entry and card display components"
```

---

### Task 9: Home page

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `homeCopy`, `profile`, `featuredPublications`, `LorenzCanvas`, `GatewayCard`, `PublicationEntry`, `SectionHead`, `buildMetadata`.

- [ ] **Step 1: Implement.** Structure (fill every `…` from `homeCopy`/`profile` — already transcribed in Task 3; copy `<head>` strings verbatim from `$OLD/index.html`):

```tsx
import { buildMetadata } from "@/lib/metadata";
import { profile } from "@/data/profile";
import { homeCopy } from "@/data/copy";
import { featuredPublications } from "@/data/publications";
import LorenzCanvas from "@/components/LorenzCanvas";
import GatewayCard from "@/components/GatewayCard";
import PublicationEntry from "@/components/PublicationEntry";
import SectionHead from "@/components/SectionHead";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "Bernardo Rivas — Nonlinear Dynamics, Topology & Computation",
  description: "…verbatim from $OLD/index.html meta description…",
  path: "/", ogType: "profile",
  ogImageAlt: "Bernardo Rivas — nonlinear dynamics, combinatorics, and topology",
});

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profile.jsonLd) }} />
      <div className="wrap">
        <div className="hero">
          <div className="hero-top">
            <img className="portrait" src="/assets/profile.jpg" alt="Portrait of Bernardo Rivas" width={164} height={172} />
            <div className="hero-heading">
              <p className="hero-kicker">{homeCopy.kicker}</p>
              <h1>Bernardo Rivas</h1>
              <p className="role">{homeCopy.role}</p>
            </div>
            <div className="hero-body">
              <p className="lede">{homeCopy.lede}</p>
              <p className="about">{homeCopy.about}</p>
              <div className="hero-actions">
                <Link className="button primary" href="/research">Explore my research <span aria-hidden="true">→</span></Link>
                <a className="button secondary" href={profile.cvHref}>Download CV</a>
              </div>
              <nav className="profile-links" aria-label="Profiles">
                {profile.links.map(l => <a key={l.label} href={l.href}>{l.label}</a>)}
              </nav>
            </div>
          </div>
        </div>
        <LorenzCanvas>{homeCopy.dynamicsCopy /* eyebrow+h2+p+keywords JSX */}</LorenzCanvas>
        <section aria-labelledby="gateway-title">
          <h2 className="sr-only" id="gateway-title">Research and teaching</h2>
          <div className="gateways">
            <GatewayCard {...homeCopy.researchGateway} />
            <GatewayCard {...homeCopy.teachingGateway} />
          </div>
        </section>
        <hr className="rule" />
        <section aria-labelledby="recent-title">
          <SectionHead id="recent-title" title="Recent work" more={{ label: "All publications", href: "/publications" }} />
          <div className="entries">{featuredPublications.map(e => <PublicationEntry key={e.id} entry={e} />)}</div>
        </section>
        <hr className="rule" />
        <aside className="side-project" aria-labelledby="lean-side-title">{homeCopy.leanAside}</aside>
      </div>
    </main>
  );
}
```

Cross-check the final DOM against `$OLD/index.html` section by section (hero button arrow markup, exact hero-actions labels, aside internals) and correct any divergence in structure/classes.

- [ ] **Step 2: Verify.** `npm run build`; open `out/index.html` via `npx serve out` next to the old site and compare visually. `grep -c "application/ld+json" out/index.html` → 1.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "Implement home page"
```

---

### Task 10: Research and publications pages

**Files:**
- Create: `src/app/research/page.tsx`, `src/app/publications/page.tsx`

**Interfaces:**
- Consumes: `researchCopy`, `publicationsCopy`, `publicationGroups`, `projects`, `ProjectCard`, `PublicationEntry`, `SectionHead`, `buildMetadata`.

- [ ] **Step 1: Research page.** `src/app/research/page.tsx`: metadata from `$OLD/research.html` head (title `Research — Bernardo Rivas` style — copy exactly). Body: `.wrap.page` with eyebrow "Research", `h1.page-title`, two `.page-lede` paragraphs; themes section (`section[aria-labelledby="themes-title"]`, `h2.sr-only#themes-title`, `.themes` with four `article.theme`, each `<span className="idx" aria-hidden="true" />` + h3 + p — the empty idx span is required, numbering is CSS); `p.note` funding note; `hr.rule`; morse-figure section (`p.lead`, `p.figure-convention`, `figure.research-figure` > `.figure-pair` with the two panels — `vanderpol-multivalued-map.png` 1422×1422 label "Multivalued map and Morse sets", `vanderpol-morse-graph.png` 395×470 label "Corresponding Morse graph" (labels are `<span>`s inside panels, figcaption at figure level), `loading="lazy"` on both); Software section (h2, `p.lead`, `.projects` of 4 `ProjectCard`); publications pointer (`SectionHead` "Publications" + more "Full list" → `/publications`, `p.lead` with inline link).

- [ ] **Step 2: Publications page.** `src/app/publications/page.tsx`:

```tsx
import { buildMetadata } from "@/lib/metadata";
import { publicationsCopy } from "@/data/copy";
import { publicationGroups } from "@/data/publications";
import PublicationEntry from "@/components/PublicationEntry";

export const metadata = buildMetadata({
  title: "Publications — Bernardo Rivas",
  description: "…verbatim from $OLD/publications.html…", path: "/publications",
});

export default function Publications() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap page">
        <p className="eyebrow">Publications</p>
        <h1 className="page-title">Publications &amp; preprints</h1>
        <p className="page-lede">{publicationsCopy.lede}</p>
        {publicationGroups.map(g => (
          <section key={g.id} aria-labelledby={`${g.id}-title`}>
            <h2 className="group-head" id={`${g.id}-title`}>{g.title}</h2>
            <div className="entries">{g.entries.map(e => <PublicationEntry key={e.id} entry={e} />)}</div>
          </section>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify.** `npm run build`; serve and compare both pages against the old site; confirm the theme numbering (1-4) appears on research themes (CSS counters + empty idx spans working).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Implement research and publications pages"
```

---

### Task 11: Talks and Lean pages

**Files:**
- Create: `src/app/talks/page.tsx`, `src/app/lean/page.tsx`

**Interfaces:**
- Consumes: `talksCopy`, `leanCopy`, `invitedTalks`, `contributedTalks`, `leanProjects`, `TalkEntry`, `buildMetadata`.

- [ ] **Step 1: Talks page.** Same shape as publications: `.wrap.page`, eyebrow "Talks", `h1` "Talks & seminars", lede, then two sections (`invited-talks-title` "Invited talks" with 7 `TalkEntry`, `contributed-talks-title` "Contributed talks" with 4). Metadata verbatim from `$OLD/talks.html`.

- [ ] **Step 2: Lean page.** From `$OLD/lean.html`: intro (eyebrow "Lean 4", h1 "Lean & formalized dynamics", two ledes); featured section (`article.lean-project.lean-project-featured` with heading block (eyebrow "Current project", h2 "Conley index foundations", `span.tag` "In progress"), two paragraphs, `<pre className="lean-code"><code>{leanProjects.featured.code}</code></pre>` — code string exact, Unicode + indentation preserved — and `p.code-caption`); `hr.rule`; "Other experiments" (`.section-head` h2 + `.lean-projects` with Formal Lorenz — figure `lean-lorenz-orbit.png` width 3600 height 1280 `loading="lazy"` + figcaption + gold `.trust-note` with inline `<strong>` and `<code>sorry</code>` — and Graph length under convexity); `hr.rule`; "Proof and teaching" (`.section-head` h2, `p.lead` with RealAnalysisGame GitHub link, `p.note`). Metadata verbatim (note old title uses `&amp;` — decode to `&`).

- [ ] **Step 3: Verify + commit**

```bash
npm run build   # then serve and compare both pages
git add -A && git commit -m "Implement talks and lean pages"
```

---

### Task 12: Teaching landing + four course pages

**Files:**
- Create: `src/app/teaching/page.tsx`, `src/app/teaching/calc-i/page.tsx`, `src/app/teaching/diffeq/page.tsx`, `src/app/teaching/math300/page.tsx`, `src/app/teaching/real-analysis/page.tsx`

**Interfaces:**
- Consumes: `teachingCopy`, `courseGroups`, `coursePages`, `CourseEntry`, `MaterialGroup`, `buildMetadata`.

- [ ] **Step 1: Landing.** `src/app/teaching/page.tsx`: `.wrap.page`; eyebrow "Teaching"; h1 "Structure students can build on"; lede; `div.teaching-proof` with `aria-label="Teaching evaluation summary"`, `<strong>4.5–4.9 / 5</strong>` + span (verbatim SIRS sentence); `p.note`; then 4 sections (one per `courseGroups` group: Toledo instructor / Rutgers instructor of record / Rutgers TA / ICMC–USP instructor), each `section[aria-labelledby]` + `h2.group-head` + `.entries` of `CourseEntry`. Metadata verbatim from `$OLD/teaching.html` (note: its og:description differs from meta description — use both fields of `buildMetadata`; this page carries `og:image:alt`).

- [ ] **Step 2: Course pages.** All four are the same 15-line shape:

```tsx
import { buildMetadata } from "@/lib/metadata";
import { coursePages } from "@/data/course-pages";
import MaterialGroup from "@/components/MaterialGroup";
import Link from "next/link";

const page = coursePages["math300"]; // per-file slug

export const metadata = buildMetadata({
  title: "Mathematical Reasoning — Bernardo Rivas",           // per-file, verbatim
  description: "…verbatim…", path: "/teaching/math300",
  ogTitle: "Mathematical Reasoning — Course Materials",       // og:title differs from title on course pages
});

export default function CoursePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap page">
        <Link className="backlink" href="/teaching">← Teaching</Link>
        <p className="eyebrow" style={{ marginTop: "0.9rem" }}>{page.eyebrow}</p>
        <h1 className="page-title">{page.title}</h1>
        <p className="meta">{page.meta}</p>
        <p className="page-lede">{page.lede}</p>
        {page.groups.map(g => <MaterialGroup key={g.title} group={g} />)}
      </div>
    </main>
  );
}
```

The inline `style={{marginTop:"0.9rem"}}` on the eyebrow reproduces the old pages' inline style (present only on backlinked pages). Per-page metadata strings verbatim from each `$OLD/teaching-*.html`; math300 and real-analysis have NO `og:image:alt` (omit the field), calc-i/diffeq — copy what their source heads have.

- [ ] **Step 3: Verify.** `npm run build`; check `out/teaching/calc-i.html` has 14 chips: `grep -o 'class="chip"' out/teaching/calc-i.html | wc -l` → 14. In the served site, the Teaching nav link must show as current on all five pages.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Implement teaching landing and course pages"
```

---

### Task 13: 404, sitemap, robots

**Files:**
- Create: `src/app/not-found.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`

**Interfaces:**
- Consumes: `notFoundCopy`, `SITE_URL`.

- [ ] **Step 1: 404.** `src/app/not-found.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found — Bernardo Rivas", robots: { index: false } };

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrap not-found">
        <p className="eyebrow">Error 404</p>
        <h1 className="page-title">This page is outside the map.</h1>
        <p className="page-lede">The address may have changed, or the page may no longer exist.</p>
        <Link className="button primary" href="/">Return home</Link>
      </div>
    </main>
  );
}
```

(The shared Footer gives this page the LinkedIn link the old 404 lacked — intentional normalization.)

- [ ] **Step 2: Sitemap + robots.** `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";

export const dynamic = "force-static";

const PATHS = ["/", "/research", "/publications", "/teaching", "/teaching/calc-i",
  "/teaching/diffeq", "/teaching/math300", "/teaching/real-analysis", "/lean", "/talks"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map(p => ({ url: `${SITE_URL}${p === "/" ? "/" : p}` }));
}
```

`src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml` };
}
```

- [ ] **Step 3: Verify + commit.** `npm run build`; `out/sitemap.xml` lists 10 URLs, no 404; `out/404.html` exists and contains `noindex`.

```bash
git add -A && git commit -m "Add 404 page, sitemap, and robots"
```

---

### Task 14: Parity verification suite

**Files:**
- Create: `scripts/parity.py`, `scripts/linkcheck.py`

**Interfaces:**
- Consumes: `out/` build and `$OLD/*.html`.

- [ ] **Step 1: Parity script.** `scripts/parity.py` (Python 3 stdlib only):

```python
#!/usr/bin/env python3
"""Diff visible text + hrefs between old pages and the Next.js export."""
import re, sys
from html.parser import HTMLParser
from pathlib import Path

OLD = Path("/Users/bdoprad/Work/Personal/website")
NEW = Path("out")
PAGES = {  # old file -> new file
    "index.html": "index.html", "research.html": "research.html",
    "publications.html": "publications.html", "talks.html": "talks.html",
    "lean.html": "lean.html", "teaching.html": "teaching.html",
    "teaching-calc-i.html": "teaching/calc-i.html",
    "teaching-diffeq.html": "teaching/diffeq.html",
    "teaching-math300.html": "teaching/math300.html",
    "teaching-real-analysis.html": "teaching/real-analysis.html",
    "404.html": "404.html",
}
SKIP_TAGS = {"script", "style"}
# Allowed differences (spec): clean URLs, 404 LinkedIn, worker-origin canonicals.

class Extract(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.text, self.hrefs, self._skip = [], [], 0
    def handle_starttag(self, tag, attrs):
        if tag in SKIP_TAGS: self._skip += 1
        for k, v in attrs:
            if k in ("href", "src") and v: self.hrefs.append(v)
    def handle_endtag(self, tag):
        if tag in SKIP_TAGS: self._skip -= 1
    def handle_data(self, d):
        if not self._skip and d.strip(): self.text.append(d.strip())

def norm_text(chunks): return re.sub(r"\s+", " ", " ".join(chunks)).strip()

def norm_href(h):
    h = h.split("#")[0]
    if h.startswith(("http", "mailto:", "data:")): return h
    h = h.lstrip("./")
    h = re.sub(r"\.html$", "", h)
    if h == "index": h = ""
    # old flat teaching pages -> new nested routes
    h = re.sub(r"^teaching-", "teaching/", h)
    return "/" + h.lstrip("/")

def extract(path):
    p = Extract(); p.feed(path.read_text(encoding="utf-8"))
    return norm_text(p.text), sorted({norm_href(h) for h in p.hrefs
        if not h.startswith("data:") and "/_next/" not in h and not h.endswith((".css", ".js"))})

fail = False
for old, new in PAGES.items():
    ot, oh = extract(OLD / old); nt, nh = extract(NEW / new)
    if ot != nt:
        fail = True
        print(f"TEXT DIFF {old}:")
        for i, (a, b) in enumerate(zip(ot.split(), nt.split())):
            if a != b: print(f"  first divergence at word {i}: {a!r} vs {b!r}"); break
        if len(ot.split()) != len(nt.split()):
            print(f"  word counts: old={len(ot.split())} new={len(nt.split())}")
    missing = [h for h in oh if h not in nh and "og-formalized" not in h]
    extra = [h for h in nh if h not in oh]
    allowed_extra = {"/", ""} | ({"https://www.linkedin.com"} if old == "404.html" else set())
    extra = [h for h in extra if not any(h.startswith(a) for a in allowed_extra if a)]
    if missing: fail = True; print(f"HREFS MISSING {old}: {missing}")
    if extra: print(f"hrefs added {old}: {extra}  (verify each is intentional)")
print("FAIL" if fail else "PASS")
sys.exit(1 if fail else 0)
```

- [ ] **Step 2: Link checker.** `scripts/linkcheck.py`:

```python
#!/usr/bin/env python3
"""Every internal href/src in out/ must resolve to a file."""
import re, sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote

NEW = Path("out")
class Links(HTMLParser):
    def __init__(self): super().__init__(); self.links = []
    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if k in ("href", "src") and v: self.links.append(v)

bad = []
for page in NEW.rglob("*.html"):
    p = Links(); p.feed(page.read_text(encoding="utf-8"))
    for link in p.links:
        if link.startswith(("http", "mailto:", "data:", "#")): continue
        path = unquote(link.split("#")[0].split("?")[0])
        t = NEW / path.lstrip("/")
        candidates = [t, Path(str(t) + ".html"), t / "index.html"]
        if not any(c.is_file() for c in candidates):
            bad.append(f"{page.relative_to(NEW)} -> {link}")
print("\n".join(bad) or "PASS")
sys.exit(1 if bad else 0)
```

- [ ] **Step 3: Run and fix.** `npm run build && python3 scripts/parity.py && python3 scripts/linkcheck.py`. Iterate on pages/data until parity prints `PASS` (text parity is expected to require several rounds of transcription fixes — that is the point of the script). The `+` filename must pass linkcheck unencoded or percent-encoded consistently.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Add parity and link-check verification scripts"
```

---

### Task 15: Final verification, README

**Files:**
- Create: `README.md`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Wire scripts.** In `package.json`: `"verify": "npm run build && npm test && python3 scripts/parity.py && python3 scripts/linkcheck.py && bash scripts/check-assets.sh"`. Run `npm run verify` → all green.

- [ ] **Step 2: Behavior pass (manual, in browser via `npx serve out`):** theme toggle flips and persists across reload with no flash; toggle beats system preference both directions; Lorenz animates, pause works, palette follows theme; reduced-motion (macOS: System Settings → Accessibility → Display → Reduce motion) starts it paused; print preview of home hides nav/footer/Lorenz; keyboard Tab reveals skip link.

- [ ] **Step 3: Visual pass.** Compare against the 26 baselines in `$OLD/.shots/` (light/dark × desktop/mobile per page). Structural/layout diffs must be fixed; anti-aliasing-level diffs are acceptable.

- [ ] **Step 4: README.** Write `README.md`: what this is, `npm run dev` / `build` / `verify`, where content lives (`src/data/` — one entry per publication/talk/course), deploy notes (static `out/`, Cloudflare, old-URL redirects `/research.html → /research` to configure at deploy, site URL constant in `src/lib/metadata.ts`).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Add verification script wiring and README"
```
