import { existsSync, readdirSync } from "node:fs";
import type { NextConfig } from "next";

/**
 * The files in `cdn/` when `next dev` starts, which `cdnUrl` then serves locally
 * (`src/lib/cdn.ts`). EMPTY FOR EVERY BUILD: a build must only ever point at the
 * CDN host. Read once, so art added while the server runs needs a restart.
 */
const localCdnFiles =
  process.env.NODE_ENV === "development" && existsSync("cdn")
    ? readdirSync("cdn").join(",")
    : "";

const nextConfig: NextConfig = {
  env: { LOCAL_CDN_FILES: localCdnFiles },
  // Static export: Firebase Hosting serves `out/` as plain files. Costs ISR,
  // request-time route handlers and middleware. Every metadata route must
  // declare `export const dynamic = "force-static"` or the build fails.
  output: "export",
  // Lets the home Mac's dev server answer over Tailscale (`/local`).
  allowedDevOrigins: ["*.ts.net"],
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
