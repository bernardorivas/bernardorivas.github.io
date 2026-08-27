// Page prose. Every page opens with its content, not with a mission statement:
// one short paragraph at most, then the list of things that link straight out.

// ---------------------------------------------------------------------------
// Landing
// ---------------------------------------------------------------------------

// The research paragraph follows curriculum-vitae/interests.tex and the summary
// of job-materials/base-2026/research-statement.tex, which name the objects at
// the right altitude (attractor lattices, Morse representations, Conley indices)
// rather than flattening Conley theory into "finite combinatorial models". The
// difficulty sentence is his own line from the hybrid-systems section of that
// statement: resets break the semiflow structure the classical theory requires.
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
  intro:
    "Topological tools provide a way to describe the global behavior of a dynamical system without tracking every trajectory in detail. I use finite combinatorial models to identify attractors and recurrent behavior, understand how they are connected, and determine which conclusions persist under perturbation or model uncertainty.",
  softwareHeading: "Software",
  fundingNote: "Supported through AFOSR MURI FA9550-23-1-0400, in collaboration with the University of Michigan.",
  // Sliding-window Lorenz + persistence animation. The pairs are precomputed
  // with ripser on the 3D windowed points; the filtration is capped at 15 so
  // the axis is not dominated by large-scale classes bridging the two wings.
  phFigure: {
    trajAria:
      "Animated Lorenz trajectory in the (x, z) plane with a highlighted sliding time window",
    diagramAria:
      "Animated persistence diagram of the points in the current time window",
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

// The Conley project, the Formal Lorenz experiment, and the graph-length
// experiment are owned by `leanProjects` in src/data/lean-projects.tsx.
export const leanCopy = {
  h1: "Lean",
  intro:
    "I use Lean 4 to check the topology behind computer-assisted dynamics. The current focus is the topological foundation of Conley index theory, alongside smaller experiments in analysis and rigorous numerics.",
  otherExperimentsHeading: "Other experiments",
  // The RealAnalysisGame line was removed: the local checkout has no commits of
  // his, so there was no fork to describe.
  teachingNote:
    "These formalizations are still local; source and notes will appear here once the repositories are ready.",
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
