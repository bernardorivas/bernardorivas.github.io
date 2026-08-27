// This module is the sole owner of the three Lean projects' content: the
// featured Conley index project (including its Lean code block, code
// caption, and two paragraphs), the Formal Lorenz experiment (including
// figure info and the trust-note JSX, containing <code>sorry</code>), and
// the Graph length under convexity experiment. `leanCopy` in copy.tsx keeps
// only the page's intro and the unrelated teaching note.

export interface LeanFeaturedProject {
  h2: string;
  paragraph1: string;
  paragraph2: string;
  codeAriaLabel: string;
  code: string;
  codeCaption: string;
}

export interface LeanFigure {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
}

export interface LeanExperiment {
  id: string;
  title: string;
  paragraph: string;
  figure?: LeanFigure;
  trustNote?: React.ReactNode;
}

const featured: LeanFeaturedProject = {
  h2: "Conley index foundations",
  paragraph1:
    "The development covers isolating neighborhoods, isolated invariant sets, exit sets, index pairs, a formal Ważewski principle for global flows, and the existence theory for index pairs. The current work is the homological Conley index, via the pointed collapse of an index pair; Morse decompositions come later.",
  paragraph2: "This is deliberately a foundations project—not yet a claim to have formalized the full Conley index theory.",
  codeAriaLabel: "Lean definition of an isolating neighborhood",
  code: `structure IsIsolatingNeighborhood
    (φ : Flow ℝ X) (N : Set X) : Prop where
  isCompact : IsCompact N
  invariantPart_subset_interior :
    φ.invariantPart N ⊆ interior N`,
  codeCaption:
    "The formal definition says exactly what the mathematics does: a compact neighborhood is isolating when its maximal invariant part lies in its interior.",
};

const experiments: LeanExperiment[] = [
  {
    id: "lean-formal-lorenz",
    title: "Formal Lorenz",
    paragraph:
      "A Lean + Julia experiment using the radii-polynomial method to certify existence and local uniqueness of a periodic orbit in the classical Lorenz system. Lean checks the analytic and fixed-point chain; Julia produces the validated numerical bounds.",
    figure: {
      src: "/assets/lean-lorenz-orbit.png",
      alt: "Three coordinate projections of a certified periodic Lorenz orbit in red over pale gray Lorenz trajectories",
      width: 3600,
      height: 1280,
      caption: "The candidate periodic orbit (red) shown in three coordinate projections.",
    },
    // .trust-note paragraph from $OLD/lean.html.
    trustNote: (
      <>
        <strong>Current trust boundary:</strong> four interval-arithmetic operator-norm bounds enter Lean as axioms; the development contains zero <code>sorry</code> placeholders. “Local uniqueness” means uniqueness in the certified Fourier sequence-space ball, not global geometric uniqueness of the orbit.
      </>
    ),
  },
  {
    id: "lean-graph-length-convexity",
    title: "Graph length under convexity",
    paragraph:
      "Two independent checked proofs of the same theorem: when two smooth graphs share endpoints, one lies above the other, and the upper graph is convex, its length is no greater. One proof uses a supporting-line inequality and integration by parts; the other uses inscribed polygons, triangle inequalities, and a Riemann-sum limit.",
  },
];

export const leanProjects = { featured, experiments };
