/**
 * Remotely-hosted asset URLs, mirroring `sil006/lib/utils/asset_urls.dart`.
 *
 * Art is served from the Habi Sloth project's Firebase Hosting `web/cdn/`,
 * which already sends `Access-Control-Allow-Origin: *` and a one-year immutable
 * cache. Hotlinking it means **no product art is committed to this public
 * repo** — the logos and illustrations are © Studio Infinite Lives, LLC and are
 * not covered by this repo's licence (see plan §6).
 *
 * Differences from the Dart original:
 *
 * - **No flavor switch.** `asset_urls.dart` picks `sil006.web.app` or
 *   `sil006-dev.web.app` off an `APP_FLAVOR` dart-define. This site has no such
 *   concept, so production is hardcoded.
 * - **`site_` prefix.** These assets belong to the marketing site, not the app,
 *   so they stay clear of the `habi_*` / `background1_*` namespace.
 *
 * Because `/cdn/**` is served immutable for a year, **a file here can never be
 * updated in place** — changing any of this art means uploading a new filename
 * and changing the constant below.
 */

const CDN_HOST = "https://sil006.web.app";

/** Builds the Firebase Hosting URL for a `web/cdn/` file. */
export function cdnUrl(fileName: string): string {
  return `${CDN_HOST}/cdn/${fileName}`;
}

/** The studio mark, from SIL-LOGO.svg. */
export const logoUrl = cdnUrl("site_infinitelives_logo.svg");

/** "Our Creations" card artwork. */
export const cardArt = {
  teamevl: cdnUrl("site_card_teamevl.png"),
  habisloth: cdnUrl("site_card_habisloth.png"),
  comingSoon: cdnUrl("site_card_pbnk.svg"),
} as const;

/**
 * Habi Sloth's own illustrations, served from the same `web/cdn/` the app
 * itself loads them from — so the site shows a visitor exactly the art the app
 * shows its users, and neither repo holds a second copy to keep in step.
 *
 * These names are the app's, not this site's, so they keep the app's `habi_*` /
 * `background1_*` prefixes rather than the `site_` one above.
 */
export const habiArt = {
  calendar: cdnUrl("habi_calendar.png"),
  friends: cdnUrl("habi_friends.png"),
  beach: cdnUrl("habi_beach.png"),
  weights: cdnUrl("habi_weights.png"),
  week: cdnUrl("habi_week.png"),
  idea: cdnUrl("habi_idea_wide.png"),
  /** Habi asleep along a branch — the blog's stand-in while there is no blog. */
  points: cdnUrl("habi_points.png"),
} as const;

/**
 * Screenshots of the running app.
 *
 * Captured for the site rather than shipped with the app, so these take the
 * `site_` prefix. They are still product art, so the CDN is where they belong
 * (plan §6) — but a file there can never be replaced, so a screenshot is
 * staged in `public/` first and only uploaded once it has been looked at.
 *
 * **Staged, not final.** `public/site_*` is gitignored, so a build on any other
 * machine will 404 on these. To promote one: upload it to `sil006/web/cdn/`,
 * swap the path below for `cdnUrl("<file>")`, and delete the local copy.
 */
export const habiScreens = {
  /** The home screen: habit editor, weekly goal and pace, and the wheel. */
  home: "/site_habisloth_home.png",
} as const;
