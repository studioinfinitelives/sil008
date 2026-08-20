import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: Firebase Hosting serves `out/` as plain files.
  // Cost of this choice — no ISR, route handlers, or middleware. See plan §7.
  output: "export",
  // No Next image optimizer exists in an export, so images must be unoptimized.
  images: { unoptimized: true },
};

export default nextConfig;
