export function navCurrent(pathname: string, href: string): boolean {
  const normalize = (path: string) => path === "/" ? path : path.replace(/\/+$/, "");
  const currentPath = normalize(pathname);
  const targetPath = normalize(href);

  if (targetPath.endsWith(".pdf")) return false;
  if (targetPath === "/teaching") {
    return currentPath === "/teaching" || currentPath.startsWith("/teaching/");
  }
  return currentPath === targetPath;
}
