import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages serves directory indexes reliably; emit /research/index.html
  // instead of relying on extensionless resolution for /research.html.
  trailingSlash: true,
};

export default nextConfig;
