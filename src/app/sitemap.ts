import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Static sitemap.
 *
 * `sitemap.ts` is a build-time route handler, so it works under
 * `output: "export"` and lands in `out/sitemap.xml` as a real file.
 *
 * The routes are listed by hand because every one of them is hand-written
 * today. `/blog` is the holding page and has no posts under it. When posts do
 * land, derive their entries from the same source their `generateStaticParams`
 * reads, so a new post cannot be published without appearing here.
 */

// Required under `output: "export"` — see `app/opengraph-image.tsx`.
export const dynamic = "force-static";

type Entry = MetadataRoute.Sitemap[number];

const routes: ReadonlyArray<
  Pick<Entry, "changeFrequency" | "priority"> & { path: string }
> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/habisloth", changeFrequency: "monthly", priority: 0.9 },
  { path: "/teamevl", changeFrequency: "monthly", priority: 0.9 },
  // The rules archive changes only when a printing does, but it is what someone
  // searching for "Team EvL rules" wants, so it is listed rather than left to
  // be found through the product page.
  { path: "/teamevl/rules", changeFrequency: "yearly", priority: 0.5 },
  // The privacy URL is what App Store / Play Store metadata points at, so it
  // is listed directly rather than left to be discovered through the section.
  { path: "/habisloth/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/habisloth/terms", changeFrequency: "yearly", priority: 0.3 },
  // The studio's own privacy and cookie notice — distinct from Habi Sloth's,
  // which governs the app rather than this site.
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
