import type { MaterialGroupData } from "@/data/types";

// Markup mirrors $OLD/teaching-diffeq.html (and the other teaching-*.html
// course pages) exactly: a bare .matgroup > h2 (no id), optional .sub, then
// either .doclinks (plain <a> per link) or .filegrid (<a class="chip">).
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
