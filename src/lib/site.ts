/**
 * Site-wide identity constants.
 *
 * The canonical host must be stated exactly once: a sitemap that disagrees with
 * `metadataBase` is not surfaced until a crawler has indexed the wrong URLs.
 * Read by `app/layout.tsx`, `sitemap.ts` and `robots.ts`.
 */

/** No trailing slash — `new URL()` and the sitemap add their own. */
export const SITE_URL = "https://infinitelives.io";

export const SITE_NAME = "Studio Infinite Lives";

export const SITE_DESCRIPTION =
  "Studio Infinite Lives builds Habi Sloth, a habit tracker for the easy going, and Team EvL, a card game.";

/**
 * The address named in the published Habi Sloth privacy policy. The old Flutter
 * site's `support@infinitelives.io` is legacy and deliberately not carried over.
 */
export const CONTACT_EMAIL = "hello@infinitelives.io";

/**
 * GA4 measurement ID. Public by construction, so it belongs here rather than in
 * a gitignored `.env` — which would also break the byte-identical dev/prod
 * exports the Makefile relies on. Dev and prod report into the same property.
 *
 * EMPTY MEANS OFF: with no ID there is no gtag.js, no banner and no cookie.
 *
 * Annotated `: string` rather than left to infer a literal type, so the `=== ""`
 * guards in `lib/analytics.ts` compile as runtime checks instead of being
 * rejected as comparisons between non-overlapping literals.
 */
export const GA_MEASUREMENT_ID: string = "G-F1R5Z95KM1";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
