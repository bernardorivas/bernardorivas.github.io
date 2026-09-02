// Dated papers are grouped in reverse chronological order. Unfinished work
// remains undated and follows the public papers.
// Year policy: once published, use the year in the definitive venue citation,
// even if the arXiv version appeared earlier. Use the arXiv v1 year only while
// a paper remains a preprint; use "forthcoming" or "in press" before a venue
// assigns a year, and omit the year for work in preparation. Thus pubLearned is
// dated 2026 from its PMLR citation, not 2025 from its arXiv posting.

import type { Publication } from "@/data/types";

// ---------------------------------------------------------------------------
// Learned and data-driven dynamics
// ---------------------------------------------------------------------------

// Published, not a preprint: the title and explicit paper link use the
// permanent open-access PMLR record. Venue verbatim from
// curriculum-vitae/publication.tex.
const pubLearned: Publication = {
  id: "pub-learned",
  title: "Topological Dynamics via Learned Hybrid Systems",
  url: "https://proceedings.mlr.press/v331/rivas26a.html",
  authors: "B. Rivas, K. Iwasaki, W. Kalies, A. Bloch, M. Ghaffari",
  venue: <>Proceedings of the 8th Annual Learning for Dynamics and Control Conference (L4DC). PMLR 331:1663–1674.</>,
  year: "2026",
  links: [
    { label: "paper", href: "https://proceedings.mlr.press/v331/rivas26a.html" },
    { label: "code", href: "https://github.com/bernardorivas/L4DC-2026" },
  ],
};

const prepCycling: Publication = {
  id: "prep-cycling",
  title: "Learning Cycling Signatures of Hybrid Systems",
  authors: "D. Hien, K. Iwasaki, B. Rivas",
  venue: "In preparation.",
};

const pubLatent: Publication = {
  id: "prep-latent",
  title: "Characterizing High-dimensional Dynamics by Combinatorial-Topological Methods on a Latent Space",
  url: "https://arxiv.org/abs/2609.01509",
  authors: "P. Bailon, M. Gameiro, B. Gelb, W. Kalies, M. Kramar, K. Mischaikow, B. Rivas, E. Vieira",
  year: "2026",
  arxivId: "2609.01509",
  links: [{ label: "code", href: "https://github.com/begelb/latent_dynamics/tree/paper" }],
};

// ---------------------------------------------------------------------------
// Regulatory networks
// ---------------------------------------------------------------------------

const pubBoolean: Publication = {
  id: "pub-boolean",
  title: "Boolean Models Coarsely Sample Continuous Dynamics of Regulatory Networks",
  url: "https://arxiv.org/abs/2606.14925",
  authors: "B. Cummins, M. Gameiro, T. Gedeon, K. Mischaikow, B. Rivas",
  year: "2026",
  arxivId: "2606.14925",
};

const pubGlobal: Publication = {
  id: "pub-global",
  title: "Global Dynamics of Ordinary Differential Equations: Wall Labelings, Conley Complexes, and Ramp Systems",
  url: "https://arxiv.org/abs/2412.11078",
  authors: "M. Gameiro, T. Gedeon, H. Kokubu, K. Mischaikow, H. Oka, B. Rivas, E. Vieira",
  year: "2024",
  arxivId: "2412.11078",
};

// Retitled and rescoped beyond PINN inference; title and author order verbatim
// from Projects/pinn-dsgrn/paper-rework/manuscript/shared.tex.
const prepInference: Publication = {
  id: "prep-inference",
  title: "Topological Validation of Parameter Inference in Gene Regulatory Networks",
  authors: "W. El Khateeb, B. Rivas, W. Kalies",
  venue: "In preparation.",
};

// Title from Projects/control-in-dsgrn/old_paper/main.tex:33, which he
// confirmed over the newer skeleton's working title ("Combinatorial analysis of
// hybrid network systems", paper/main.tex:29). Collaborators are Kalies,
// Mischaikow, and Gameiro, listed alphabetically at his direction.
const prepControl: Publication = {
  id: "prep-control",
  title: "Towards an Algorithmic Approach to Control of Dynamic Phenotypes",
  authors: "M. Gameiro, W. Kalies, K. Mischaikow, B. Rivas",
  venue: "In preparation.",
};

// ---------------------------------------------------------------------------
// Hybrid dynamical systems
// ---------------------------------------------------------------------------

const pubHybrid: Publication = {
  id: "pub-hybrid",
  title: "Conley Index Theory for Hybrid Systems",
  url: "https://arxiv.org/abs/2606.18501",
  authors: "B. Rivas, W. Kalies",
  year: "2026",
  arxivId: "2606.18501",
};

// Author order verbatim from Projects/computational-hybrid/paper/main.tex:105.
const prepAttractor: Publication = {
  id: "prep-attractor",
  title: "Hybrid Attractor Lattices",
  authors: "W. Kalies, B. Rivas, T. Wehbe",
  venue: "In preparation.",
};

export const researchPublicationGroups: { id: string; title: string; publications: Publication[] }[] = [
  {
    id: "research-2026",
    title: "2026",
    publications: [pubLatent, pubLearned, pubHybrid, pubBoolean],
  },
  {
    id: "research-2024",
    title: "2024",
    publications: [pubGlobal],
  },
  {
    id: "research-in-preparation",
    title: "In preparation",
    publications: [prepCycling, prepAttractor, prepInference, prepControl],
  },
];

export const researchPublications: Publication[] = researchPublicationGroups.flatMap(
  (group) => group.publications,
);

// The three most recent papers, shown on the landing page.
export const recentPublications: Publication[] = [pubLatent, pubLearned, pubHybrid];
