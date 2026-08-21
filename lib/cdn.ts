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
  comingSoon: cdnUrl("site_card_comingsoon.png"),
} as const;
