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

/**
 * GA4 measurement ID for the infinitelives.io web data stream.
 *
 * Public by construction — it ships in the page source of every analytics site,
 * so it belongs here beside `SITE_URL` rather than in a `.env` (which is
 * gitignored, and would break the Makefile's byte-identical dev/prod exports).
 *
 * The `G-` form of GA property 550710966 / data stream 15463222007, which
 * Firebase created alongside the web app in the `sil008` project. Recover it
 * with `firebase apps:sdkconfig WEB <appId>` if it is ever in doubt — but note
 * the site itself uses no Firebase SDK, only gtag.js.
 *
 * **EMPTY MEANS OFF**, and every entry point in `lib/analytics.ts` checks: with
 * no ID there is no gtag.js, no consent banner and no cookie of any kind. That
 * is the switch to flip to take analytics off the site entirely.
 *
 * Note that the review site sil008-dev.web.app reports into the same property:
 * dev and prod exports are byte-identical on purpose (see the Makefile).
 *
 * Annotated `: string` rather than left to infer its literal type, so that the
 * `=== ""` guards above are compiled as the runtime checks they are instead of
 * being rejected as comparisons between two non-overlapping literals.
 */
export const GA_MEASUREMENT_ID: string = "G-F1R5Z95KM1";

/** Absolute URL for a route, for the metadata fields that require one. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
