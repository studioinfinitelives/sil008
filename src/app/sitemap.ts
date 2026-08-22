import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Static sitemap.
 *
 * `sitemap.ts` is a build-time route handler, so it works under
 * `output: "export"` and lands in `out/sitemap.xml` as a real file.
 *
 * The routes are listed by hand because every one of them is hand-written
 * today. Once blog posts are backed by real content, the `/blog/*` entries
 * should be derived from the same source `generateStaticParams` reads, so a new
 * post cannot be published without appearing here.
 */

// Required under `output: "export"` — see `app/opengraph-image.tsx`.
export const dynamic = "force-static";

type Entry = MetadataRoute.Sitemap[number];

const routes: ReadonlyArray<
  Pick<Entry, "changeFrequency" | "priority"> & { path: string }
> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/habisloth", changeFrequency: "monthly", priority: 0.9 },
  { path: "/habisloth/support", changeFrequency: "yearly", priority: 0.5 },
  { path: "/habisloth/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/habisloth/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(({ path, ...rest }) => ({
    url: absoluteUrl(path),
    lastModified,
    ...rest,
  }));
}
