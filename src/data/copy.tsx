// Page prose. Every page opens with its content, not with a mission statement:
// one short paragraph at most, then the list of things that link straight out.

// ---------------------------------------------------------------------------
// Landing
// ---------------------------------------------------------------------------

export const homeCopy = {
  // The name lives in the sidebar on every page, so the landing heading names
  // the section instead of repeating it.
  h1: "About",
  paragraphs: [
    "I am a mathematician working on nonlinear dynamical systems, with applications in gene regulation, robotics and control. My research builds on topological-combinatorial frameworks to characterize global dynamics under perturbation and model uncertainty.",
    "My current work develops these ideas in two directions. The first is hybrid systems, which combine continuous behavior with sudden events such as switches, impacts, or resets. The second is data-driven systems, where the equations are not fully known and the dynamics must be reconstructed from observations. In both settings, I aim to understand the system's long-term behavior despite incomplete information or abrupt changes.",
    "Since 2025 I have been a postdoctoral fellow in mathematics at the University of Toledo, working with Bill Kalies on an AFOSR MURI in collaboration with the University of Michigan. Before that, I completed my PhD with Konstantin Mischaikow at Rutgers University, and my BSc and MSc at the Universidade de São Paulo in Brazil.",
  ],
  recentHeading: "Recent work",
};

// ---------------------------------------------------------------------------
// Research
// ---------------------------------------------------------------------------

export const researchCopy = {
  h1: "Research",
};

// ---------------------------------------------------------------------------
// Software
// ---------------------------------------------------------------------------

export const softwareCopy = {
  h1: "Software",
  intro:
    "Topological tools provide a way to describe the global behavior of a dynamical system without tracking every trajectory in detail. The goal is to identify attractors and recurrent structure, understand how they are connected, and determine which conclusions persist under perturbation or model uncertainty.",
  projectsHeading: "Projects",
  // Grid cells carried by the time-1.3 map of the Van der Pol flow, the outer
  // approximation from padded samples as a graph on all cells, its Morse sets,
  // Morse graph and Conley indices (src/lib/morse-figure.ts). The earlier Lorenz + persistence
  // figure is in archive/lorenz-persistence.
  oaFigure: {
    aria:
      "Animated grid over the phase plane of the Van der Pol oscillator. A few cells move along the flow to their images under the time-1.3 map, and the grid cells covering each image are shaded. Then every cell is joined to the cells covering its image. Two groups of cells remain, one around the equilibrium and one around the periodic orbit, and they move aside as the two vertices of a Morse graph. The cells between the two groups and a copy of the second join the first; together they straighten into a disk whose boundary closes up into a sphere, while the second group shrinks to a circle, with an arrow from the sphere to the circle. Their Conley indices are shown as (0, 0, 1) and (1, 1, 0), with an arrow from the first to the second.",
  },
};

// ---------------------------------------------------------------------------
// Talks
// ---------------------------------------------------------------------------

export const talksCopy = {
  h1: "Talks",
};

// ---------------------------------------------------------------------------
// Lean
// ---------------------------------------------------------------------------

export const leanCopy = {
  h1: "Lean",
  intro: "I have been using Lean to formalize toy projects and design courses. If that's something you're interested in, let's talk. (:",
  projectsHeading: "Projects",
};

// ---------------------------------------------------------------------------
// Teaching
// ---------------------------------------------------------------------------

export const teachingCopy = {
  h1: "Teaching",
};

// ---------------------------------------------------------------------------
// 404
// ---------------------------------------------------------------------------

export const notFoundCopy = {
  h1: "This page is outside the map.",
  lede: "The address may have changed, or the page may no longer exist.",
  backLabel: "Return home",
};
