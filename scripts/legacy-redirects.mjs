import {
  access,
  copyFile,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";

const OUTPUT = "out";
const SITE_ORIGIN = "https://bernardorivas.github.io";
const CHECK_ONLY = process.argv.includes("--check");

// Keep unvetted teaching material in the source checkout without including it
// in the public GitHub Pages artifact. Removing an item from this list restores
// it on the next build.
const UNPUBLISHED_OUTPUTS = [
  "files/teaching",
  "teaching/calc-i",
  "teaching/diffeq",
  "teaching/math300",
  "teaching/real-analysis",
];

// GitHub Pages has no server-side redirects. These small static documents keep
// links to the Hugo site and earlier hand-written versions useful.
const REDIRECTS = [
  ["/about/", "/"],
  ["/about.html", "/"],
  ["/research.html", "/research/"],
  ["/publications/", "/research/"],
  ["/publications.html", "/research/"],
  ["/software.html", "/research/#software-title"],
  ["/projects.html", "/research/#software-title"],
  ["/talks.html", "/talks/"],
  ["/teaching.html", "/teaching/"],
  ["/lean.html", "/lean/"],
  ["/teaching-calc-i.html", "/teaching/#course-calc-2021"],
  ["/teaching-diffeq.html", "/teaching/#course-ode-2022"],
  ["/teaching-math300.html", "/teaching/#course-reasoning-2023"],
  ["/teaching-real-analysis.html", "/teaching/#course-real-summer-2024"],
  ["/cv/", "/files/cv.pdf"],
  ["/cv.html", "/files/cv.pdf"],
  ["/resume.html", "/files/cv.pdf"],

  ["/talks/siam-ds25/", "/talks/#talk-systems-biology"],
  ["/talks/dynamics-seminar/", "/talks/#talk-grn-dynamics"],
  ["/talks/ams-seminar/", "/talks/#talk-network-dynamics"],
  ["/talks/montreal-workshop/", "/talks/#talk-analytical-bounds"],
  ["/talks/ams-eastern/", "/talks/#talk-framework"],
  ["/talks/leiden-workshop/", "/talks/#talk-combinatorial-method"],
  ["/talks/summer-meeting/", "/talks/#talk-invariant-manifolds"],

  ["/teaching/su24_real-analysis/", "/teaching/#course-real-summer-2024"],
  ["/teaching/sp24_real-analysis-ta/", "/teaching/#course-real-spring-2024"],
  ["/teaching/fa23_real-analysis-ta/", "/teaching/#course-real-fall-2023"],
  ["/teaching/su23_math-reasoning/", "/teaching/#course-reasoning-2023"],
  ["/teaching/sp23_differential-equations-ta/", "/teaching/#course-ode-244-2023"],
  ["/teaching/fa22_adv-calc-for-eng-ta/", "/teaching/#course-advanced-calc-2022"],
  ["/teaching/fa22_statistics-ta/", "/teaching/#course-stats-2022"],
  ["/teaching/su22_differential-equations/", "/teaching/#course-ode-2022"],
  ["/teaching/sp22_differential-equations-ta/", "/teaching/#course-ode-244-2022"],
  ["/teaching/fa21_calculus-i-ta/", "/teaching/#course-calc-2021"],
  ["/teaching/wi19_minicourse-differential-equations/", "/teaching/#course-minicourse-2019"],

  ["/publication/preprint/", "/research/#pub-global"],
  ["/publication_types/article/", "/research/#pub-global"],
  ["/publication/", "/research/"],
  ["/publication_types/", "/research/"],
  ["/project/cmgdb/", "/research/#project-cmgdb"],
  ["/project/dsgrn/", "/research/#project-dsgrn"],
  ["/project/", "/research/#software-title"],
  ["/projects/", "/research/#software-title"],
  ["/activities/", "/"],

  ["/tags/", "/"],
  ["/tags/analytical-bounds/", "/talks/#talk-analytical-bounds"],
  ["/tags/applied-mathematics/", "/talks/#talk-systems-biology"],
  ["/tags/systems-biology/", "/talks/#talk-systems-biology"],
  ["/tags/biological-networks/", "/talks/#talk-combinatorial-method"],
  ["/tags/combinatorics/", "/talks/#talk-network-dynamics"],
  ["/tags/network-dynamics/", "/talks/#talk-network-dynamics"],
  ["/tags/topology/", "/talks/#talk-network-dynamics"],
  ["/tags/computational-dynamics/", "/talks/#talk-grn-dynamics"],
  ["/tags/computational-topology/", "/talks/#talk-framework"],
  ["/tags/genetic-regulatory-networks/", "/talks/#talk-framework"],
  ["/tags/differential-equations/", "/talks/#talk-invariant-manifolds"],
  ["/tags/invariant-manifolds/", "/talks/#talk-invariant-manifolds"],
  ["/tags/rigorous-numerics/", "/talks/#talk-invariant-manifolds"],
  ["/tags/nonlinear-dynamics/", "/talks/#talk-analytical-bounds"],
  ["/tags/combinatorial-topology/", "/talks/"],
  ["/tags/gene-regulatory-networks/", "/talks/"],
  ["/tags/dynamical-systems/", "/research/"],
  ["/tags/cmgdb/", "/research/#project-cmgdb"],
  ["/tags/dsgrn/", "/research/#project-dsgrn"],
  ["/tags/instructor/", "/teaching/"],
  ["/tags/rutgers-university/", "/teaching/"],
  ["/tags/rutgers-univesity/", "/teaching/"],
  ["/tags/ta/", "/teaching/"],
  ["/tags/universidade-de-sao-paulo/", "/teaching/#course-minicourse-2019"],
];

const FILE_ALIASES = [
  ["files/cv.pdf", "uploads/resume.pdf"],
  ["assets/cmgdb.png", "project/cmgdb/featured.png"],
  ["assets/dsgrn.png", "project/dsgrn/featured.png"],
];

function escapeAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function redirectFile(legacyPath) {
  const relative = legacyPath.replace(/^\/+|\/+$/g, "");
  if (!relative) throw new Error("Refusing to replace the home page");
  return legacyPath.endsWith(".html")
    ? join(OUTPUT, relative)
    : join(OUTPUT, relative, "index.html");
}

function redirectDocument(target) {
  const escapedTarget = escapeAttribute(target);
  const canonicalPath = target.split("#", 1)[0];
  const canonical = escapeAttribute(new URL(canonicalPath, SITE_ORIGIN).href);
  const scriptTarget = JSON.stringify(target);

  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    '  <meta name="robots" content="noindex, nofollow">',
    '  <meta http-equiv="refresh" content="0;url=' + escapedTarget + '">',
    '  <link rel="canonical" href="' + canonical + '">',
    "  <title>Page moved — Bernardo Rivas</title>",
    "  <script>",
    "    const destination = new URL(" + scriptTarget + ", window.location.origin);",
    "    destination.search = window.location.search;",
    "    if (!destination.hash) destination.hash = window.location.hash;",
    "    window.location.replace(destination.href);",
    "  </script>",
    "</head>",
    "<body>",
    '  <p>This page moved to <a href="' + escapedTarget + '">' + escapedTarget + "</a>.</p>",
    "</body>",
    "</html>",
    "",
  ].join("\n");
}

async function assertMissing(path) {
  try {
    await access(path);
    throw new Error("Refusing to overwrite generated route: " + path);
  } catch (error) {
    if (error && error.code === "ENOENT") return;
    throw error;
  }
}

async function writeRedirects() {
  const outputs = new Set();
  for (const [legacyPath, target] of REDIRECTS) {
    if (!legacyPath.startsWith("/") || !target.startsWith("/")) {
      throw new Error("Redirect paths must be root-relative");
    }
    const output = redirectFile(legacyPath);
    if (outputs.has(output)) throw new Error("Duplicate redirect output: " + output);
    outputs.add(output);
    await assertMissing(output);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, redirectDocument(target), "utf8");
  }

  for (const [source, alias] of FILE_ALIASES) {
    const sourcePath = join(OUTPUT, source);
    const aliasPath = join(OUTPUT, alias);
    await assertMissing(aliasPath);
    await mkdir(dirname(aliasPath), { recursive: true });
    await copyFile(sourcePath, aliasPath);
  }

  console.log("Generated " + REDIRECTS.length + " legacy redirects and " + FILE_ALIASES.length + " file aliases.");
}

async function removeUnpublishedOutputs() {
  for (const relativePath of UNPUBLISHED_OUTPUTS) {
    await rm(join(OUTPUT, relativePath), { recursive: true, force: true });
  }
}

async function checkUnpublishedOutputs() {
  for (const relativePath of UNPUBLISHED_OUTPUTS) {
    await assertMissing(join(OUTPUT, relativePath));
  }
}

async function checkRedirects() {
  for (const [legacyPath, target] of REDIRECTS) {
    const content = await readFile(redirectFile(legacyPath), "utf8");
    if (!content.includes('content="noindex, nofollow"')) {
      throw new Error("Missing noindex metadata for " + legacyPath);
    }
    if (!content.includes('href="' + escapeAttribute(target) + '"')) {
      throw new Error("Wrong fallback target for " + legacyPath);
    }
  }

  for (const [source, alias] of FILE_ALIASES) {
    const sourceContent = await readFile(join(OUTPUT, source));
    const aliasContent = await readFile(join(OUTPUT, alias));
    if (!sourceContent.equals(aliasContent)) {
      throw new Error("File alias does not match source: " + alias);
    }
  }

  console.log("PASS (" + REDIRECTS.length + " legacy redirects, " + FILE_ALIASES.length + " file aliases)");
}

await access(OUTPUT);
if (CHECK_ONLY) {
  await checkRedirects();
  await checkUnpublishedOutputs();
} else {
  await writeRedirects();
  await removeUnpublishedOutputs();
}
