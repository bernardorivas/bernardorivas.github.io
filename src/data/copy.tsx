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
    "I am a mathematician working on nonlinear dynamical systems, with applications in gene regulation, robotics, and control. My research builds on Conley theory, a topological framework that characterizes a system's global behavior in a way that remains valid under perturbation and model uncertainty.",
    "My current work addresses two settings where classical theory is hardest to apply: hybrid systems, whose dynamics switch between distinct modes, and data-driven systems, where the dynamics are not fully known and must be reconstructed from partial measurements. Conley theory is well suited to both since it describes the global structure of the dynamics at a topological level of resolution, coarse enough to survive incomplete models and, with the right extension, discontinuous ones.",
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
    "I build combinatorial models of flows and networks, attach topological invariants to recurrent regions, and develop arguments that connect those finite computations back to the continuous dynamics.",
  figure: {
    mapAlt:
      "Rectangular grid with blue directional arrows, blue Morse regions, and an orange central cell in a finite multivalued model of the Van der Pol system",
    mapLabel: "Multivalued map and Morse sets",
    graphAlt: "Two-node Morse graph with an orange node above a blue node and one downward arrow",
    graphLabel: "Corresponding Morse graph",
    caption:
      "A Van der Pol example from ongoing work on Rook Fields. The finite multivalued model and its colored Morse sets (left) collapse to a two-node Morse graph carrying the computed index labels (right).",
  },
  softwareHeading: "Software",
  fundingNote: "Supported through AFOSR MURI FA9550-23-1-0400, in collaboration with the University of Michigan.",
  // Sliding-window Lorenz + persistence animation. The pairs are precomputed
  // with ripser on the 3D windowed points; the filtration is capped at 15 so
  // the axis is not dominated by large-scale classes bridging the two wings.
  phFigure: {
    trajLabel: "Sliding window on a Lorenz trajectory",
    diagramLabel: "Persistence diagram of the window (H₁)",
    trajAria:
      "Animated Lorenz trajectory in the (x, z) plane with a highlighted sliding time window",
    diagramAria:
      "Animated persistence diagram of the points in the current time window",
    caption: (
      <>
        A trajectory of the Lorenz system observed through a sliding time window [t<sub>i</sub>, t<sub>f</sub>]
        (left), and the degree-one persistence diagram of the windowed points (right). Each diagram point
        records a loop in the Vietoris–Rips complexes built on the window, appearing and disappearing at the
        scales on the axes: revolutions around the two wings show up far from the diagonal, sampling noise
        stays near it.
      </>
    ),
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
