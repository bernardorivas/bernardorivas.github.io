import { buildMetadata } from "@/lib/metadata";
import DonutAnimation from "./DonutAnimation";
import styles from "./donut.module.css";

export const metadata = buildMetadata({
  title: "Why a donut has two holes | Bernardo Rivas",
  description: "Trace two independent loops on a torus and see how they close in a square with opposite edges identified.",
  path: "/misc/donut",
});

export default function DonutPage() {
  return (
    <main className={styles.main} id="main-content" tabIndex={-1}>
      <div className={`wrap page ${styles.page}`}>
        <h1 className="page-title">Why a donut has two holes</h1>
        <p className="page-intro">Follow two loops on the donut’s surface. One goes around the center, and the other wraps around the tube.</p>

        <DonutAnimation />

        <p className={styles.explanation}>The square’s matching edges are glued, so each straight line closes into a loop. The two circle projections give winding numbers <span className={styles.pair}>(1, 0)</span> for <i>a</i> and <span className={styles.pair}>(0, 1)</span> for <i>b</i>. These loops generate the first homology of the torus.</p>
        <p className={styles.formula} role="math" aria-label="H sub one of the torus with integer coefficients is isomorphic to Z squared">
          <span aria-hidden="true"><i>H</i><sub>1</sub>(<i>T</i><sup>2</sup>; ℤ) ≅ ℤ<sup>2</sup></span>
        </p>
      </div>
    </main>
  );
}
