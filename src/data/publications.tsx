// Papers, grouped by research theme rather than by publication status: the
// Research page is the single place where the work is listed, so the status
// (published / in preparation) lives on each entry's venue line when relevant,
// the grouping carries the theme instead.
//
// The three groups follow the three directions named in his research statement:
// topological validation of data-driven and learned systems, combinatorial
// models for regulatory networks, and Conley theory for hybrid systems. Several
// papers are hybrid AND learned (both L4DC papers are literally about learned
// hybrid systems); they are grouped by method, so the hybrid group holds the
// pure Conley-theoretic work.

import type { Publication } from "@/data/types";

// ---------------------------------------------------------------------------
// Learned and data-driven dynamics
// ---------------------------------------------------------------------------

// Published, not a preprint: the title links to the PMLR record (open access,
// so nothing is lost by dropping the arXiv link). Venue verbatim from
// curriculum-vitae/publication.tex.
const pubLearned: Publication = {
  id: "pub-learned",
  title: "Topological Dynamics via Learned Hybrid Systems",
  url: "https://proceedings.mlr.press/v331/rivas26a.html",
  authors: "B. Rivas, K. Iwasaki, W. Kalies, A. Bloch, M. Ghaffari",
  venue: <>Proceedings of the 8th Annual Learning for Dynamics and Control Conference (L4DC). PMLR 331:1663–1674.</>,
  year: "2026",
  links: [{ label: "code", href: "https://github.com/bernardorivas/L4DC-2026" }],
};

const prepCycling: Publication = {
  id: "prep-cycling",
  title: "Learning Cycling Signatures of Hybrid Systems",
  authors: "D. Hien, K. Iwasaki, B. Rivas",
  venue: "In preparation.",
};

const prepLatent: Publication = {
  id: "prep-latent",
  title: "Rigorously Characterizing High-dimensional Dynamics by Combinatorial-Topological Methods on a Latent Space",
  withAuthors: "P. Bailon, M. Gameiro, B. Gelb, M. Kramar, W. Kalies, K. Mischaikow",
  venue: "In preparation.",
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
  authors: "M. Gameiro, T. Gedeon, H. Kokubu, K. Mischaikow, H. Oka, B. Rivas, E. Vieira, D. Gameiro",
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

// Group order puts the published paper first.
export const researchGroups: {
  title: string;
  id: string;
  entries: Publication[];
  relatedWork?: { title: string; url: string };
}[] = [
  {
    title: "Learned and data-driven dynamics",
    id: "learned-title",
    entries: [pubLearned, prepCycling, prepLatent],
  },
  {
    title: "Regulatory networks",
    id: "networks-title",
    entries: [pubBoolean, pubGlobal, prepInference, prepControl],
  },
  {
    title: "Hybrid dynamical systems",
    id: "hybrid-title",
    entries: [pubHybrid, prepAttractor],
    relatedWork: {
      title: pubLearned.title,
      url: pubLearned.url!,
    },
  },
];

// The three most recent papers, shown on the landing page.
export const recentPublications: Publication[] = [pubLearned, pubHybrid, pubBoolean];
