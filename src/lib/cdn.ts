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
  idea: cdnUrl("habi_idea_wide.png"),
} as const;

/**
 * The habit wheel's backdrop, recoloured per the palette the user picked —
 * mirroring `backgroundUrlForColorKey` in the app's `asset_urls.dart`.
 *
 * The app generates one of these for every selectable colour, so picking a key
 * here is choosing which of the app's own looks the site shows. `background1`
 * (no suffix) is the untinted default.
 */
export type BackgroundColorKey =
  | "blush"
  | "coral"
  | "lemon"
  | "mint"
  | "peach"
  | "sage"
  | "tearose"
  | "tiffanyblue"
  | "vanilla";

export function wheelBackgroundUrl(key: BackgroundColorKey): string {
  return cdnUrl(`background1_${key}.png`);
}
