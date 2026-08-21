import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: Firebase Hosting serves `out/` as plain files.
  // Cost of this choice — no ISR, route handlers, or middleware. See plan §7.
  output: "export",
  images: {
    // No Next image optimizer exists in an export, so images must be unoptimized.
    unoptimized: true,
    // Art is hotlinked from the Habi Sloth CDN so none is committed here (§6).
    remotePatterns: [
      { protocol: "https", hostname: "sil006.web.app", pathname: "/cdn/**" },
    ],
  },
};

export default nextConfig;
