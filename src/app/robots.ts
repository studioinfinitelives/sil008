import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Emits `out/robots.txt` at build time. Nothing is disallowed; the point of the
 * file is the `Sitemap:` line.
 */
// Required under `output: "export"` — see `app/opengraph-image.tsx`. Every
// metadata route handler needs this, `sitemap.ts` included.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
