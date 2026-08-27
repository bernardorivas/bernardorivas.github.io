"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navCurrent } from "@/lib/nav";
import { profile } from "@/data/profile";
import { publicNavItems } from "@/data/routes";
import ThemeToggle from "@/components/ThemeToggle";

const LINKS = [
  ...publicNavItems,
  { label: "CV", href: profile.cvHref },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="site-nav">
      <div className="wrap">
        <Link className="brand" href="/" aria-current={pathname === "/" ? "page" : undefined}>Bernardo Rivas</Link>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map(l =>
            l.href.endsWith(".pdf")
              ? <a key={l.href} href={l.href}>{l.label}</a>
              : <Link key={l.href} href={l.href} aria-current={navCurrent(pathname, l.href) ? "page" : undefined}>{l.label}</Link>
          )}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
