import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Emits `out/robots.txt` at build time. Nothing is disallowed; the point of the
 * file is the `Sitemap:` line.
 */
// REQUIRED under `output: "export"`: a metadata route is a Route Handler, and
// Next refuses to export one that has not declared itself static. Omitting this
// fails the build rather than silently skipping the file. `sitemap.ts` too.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
