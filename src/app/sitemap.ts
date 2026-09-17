import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Static sitemap, emitted to `out/sitemap.xml` at build time.
 *
 * Routes are listed by hand because all of them are hand-written today. When
 * blog posts land, derive their entries from the same source their
 * `generateStaticParams` reads, so a post cannot ship without appearing here.
 */

// Required under `output: "export"` — see `robots.ts`.
export const dynamic = "force-static";

type Entry = MetadataRoute.Sitemap[number];

const routes: ReadonlyArray<
  Pick<Entry, "changeFrequency" | "priority"> & { path: string }
> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/habisloth", changeFrequency: "monthly", priority: 0.9 },
  { path: "/teamevl", changeFrequency: "monthly", priority: 0.9 },
  // Listed directly rather than left to be found through the product page:
  // this is what a search for "Team EvL rules" wants.
  { path: "/teamevl/rules", changeFrequency: "yearly", priority: 0.5 },
  { path: "/teamevl/howtoplay", changeFrequency: "yearly", priority: 0.6 },
  // Listed directly: this is the URL App Store / Play Store metadata points at.
  { path: "/habisloth/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/habisloth/terms", changeFrequency: "yearly", priority: 0.3 },
  // The studio's own notice, distinct from Habi Sloth's.
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
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
