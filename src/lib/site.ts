/**
 * Site-wide constants — the single source of truth for identity and canonical
 * URLs.
 *
 * Everything that needs to name the site reads from here: the root metadata in
 * `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, and both
 * `opengraph-image.tsx` routes. The canonical host in particular must be stated
 * exactly once — a sitemap that disagrees with `metadataBase` is the kind of
 * error nothing surfaces until a crawler has already indexed the wrong URLs.
 */

/** Canonical origin. No trailing slash — `new URL()` and the sitemap both add their own. */
export const SITE_URL = "https://infinitelives.io";

export const SITE_NAME = "Studio Infinite Lives";

export const SITE_DESCRIPTION =
  "Studio Infinite Lives builds Habi Sloth, a habit tracker for the easy going, and Team EvL, a card game.";

/**
 * The studio's contact address.
 *
 * This is the address named in the published Habi Sloth privacy policy, and the
 * only one used anywhere in the app. The old Flutter site's
 * `support@infinitelives.io` is legacy and deliberately not carried forward.
 */
export const CONTACT_EMAIL = "hello@infinitelives.io";

/** Absolute URL for a route, for the metadata fields that require one. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
