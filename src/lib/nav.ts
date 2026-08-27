export function navCurrent(pathname: string, href: string): boolean {
  if (href.endsWith(".pdf")) return false;
  if (href === "/teaching") return pathname === "/teaching" || pathname.startsWith("/teaching/");
  return pathname === href;
}
