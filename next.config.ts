import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: Firebase Hosting serves `out/` as plain files. Costs ISR,
  // request-time route handlers and middleware. Every metadata route must
  // declare `export const dynamic = "force-static"` or the build fails.
  output: "export",
  // Type-checks every internal `<Link href>` against the routes that exist, so
  // a dead internal link fails `tsc`. Stable as of Next 16.
  typedRoutes: true,
  images: {
    // No image optimizer exists in an export, so this is forced, not a choice.
    // Every `<Image>` width/height must be the file's true pixels.
    unoptimized: true,
    // One art host, no flavor split — see `src/lib/cdn.ts`.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.infinitelives.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
