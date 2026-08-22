import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Like `sitemap.ts`, a build-time route handler — emits `out/robots.txt`.
 *
 * Everything here is public marketing content, so nothing is disallowed. The
 * point of the file is the `Sitemap:` line: it is how a crawler that arrived at
 * an arbitrary page discovers the rest of the site.
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
