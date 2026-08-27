// Wraps every occurrence of "B. Rivas" in an author list with a
// <span className="author-self"> so the self-author can be visually
// highlighted, matching $OLD's hand-authored <span class="author-self"> markup.
export function highlightSelf(authors: string): React.ReactNode {
  const parts = authors.split("B. Rivas");
  const out: React.ReactNode[] = [];
  parts.forEach((p, i) => {
    if (p) out.push(p);
    if (i < parts.length - 1) out.push(<span key={i} className="author-self">B. Rivas</span>);
  });
  return out;
}
