/**
 * Remotely-hosted asset URLs, mirroring `sil006/lib/utils/asset_urls.dart`.
 *
 * Art is served from this site's own CDN Hosting site, which sends
 * `Access-Control-Allow-Origin: *` and a one-year immutable cache. Serving it
 * remotely means **no product art is committed to this public repo** — the
 * logos and illustrations are © Studio Infinite Lives, LLC and are not covered
 * by this repo's licence (see plan §6).
 *
 * The files live in this repo's `cdn/` and are published by `make deploy-cdn`,
 * independently of the site itself — no build, no deploy, seconds.
 *
 * Differences from the Dart original:
 *
 * - **`site_` prefix.** These assets belong to the marketing site, not the app,
 *   so they stay clear of the `habi_*` / `background1_*` namespace.
 * - **No flavor split.** One host serves every build; the app's `cdnUrl` lost
 *   its flavor argument for the same reason.
 *
 * Because the CDN is served immutable for a year, **a file here can never be
 * updated in place** — changing any of this art means uploading a new filename
 * and changing the constant below.
 */

/**
 * The studio's art host — one site (`sil-studio-art`), one publisher, shared by
 * every build.
 *
 * Read at **build time only**: this module is imported exclusively by server
 * components, so the host is baked into the exported HTML and never reaches the
 * client bundle.
 *
 * Deliberately *not* the app's `cdn.habisloth.app`. A Hosting deploy is a
 * whole-site atomic replacement, so hotlinking the app's site would let a
 * sil006 art deploy break this site's pages. Habi Sloth art this site uses is
 * duplicated into `cdn-studio/` instead — see `habiArt`.
 */
const CDN_HOST = "https://cdn.infinitelives.io";

/** Builds the URL for a file published to this site's CDN from `cdn-studio/`. */
export function cdnUrl(fileName: string): string {
  return `${CDN_HOST}/${fileName}`;
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
 * Habi Sloth's own illustrations.
 *
 * These are **copies** of the app's art, kept in this repo's `cdn/` alongside
 * the `site_*` files rather than hotlinked from `cdn.habisloth.app`. One site,
 * one publisher: an app art deploy replaces its whole site, and this site's
 * pages must not be able to break because of it. The cost is that a recrop on
 * the app's side has to be carried over by hand — `cdn.test.ts` fails when the
 * two copies drift, as long as `../sil006` is checked out.
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
 * Team EvL's illustrations.
 *
 * These take an `evl_` product prefix rather than the `site_` one: the rule
 * above keeps site chrome clear of a product's namespace, and these are the
 * game's own art, not chrome. Unlike `habi_*` no app owns these names, so this
 * file is where they are coined.
 *
 * Each piece carries its own pixel size rather than a shared ratio, because
 * `next/image` is unoptimized site-wide: the numbers do nothing but reserve the
 * box before the file arrives, so they have to be what was actually uploaded or
 * the row resizes underneath the reader. Keeping them next to the URL is what
 * stops the two drifting apart — `cdn.test.ts` checks the file exists, but
 * nothing can check a ratio except the eye.
 *
 * The drawn art was delivered at print resolution — 2400–3600px wide, 2–5 MB
 * each — and is republished downscaled to **1200px on the long edge**. Every one
 * of these rows renders inside `max-w-md` (448px), so 1200 is still better than
 * twice what the widest screen asks for, and again: unoptimized means whatever
 * is in `cdn/` is byte-for-byte what a visitor downloads. The hero is the
 * exception at 1600, because it runs the full `max-w-6xl` gutter rather than a
 * row's column.
 *
 * Because `/cdn/**` is immutable, replacing any of these means uploading a new
 * filename and changing it here.
 */
export const evlArt = {
  /** The banner across the top of /teamevl, the full width of the gutter. */
  hero: { src: cdnUrl("evl_hero.png"), width: 1600, height: 600 },
  /** The Element cards fanned out beside the box. */
  cards: { src: cdnUrl("evl_cards.png"), width: 1200, height: 640 },
  /** The Element tokens — the pieces a turn moves within the circle. */
  tokens: { src: cdnUrl("evl_tokens.png"), width: 1200, height: 778 },
  /** Three Ritual Cards fanned, each with its own arrangement of Elements. */
  ritualCards: {
    src: cdnUrl("evl_ritual_cards.png"),
    width: 1200,
    height: 1021,
  },
  /** The sheet of summonable demons. */
  demons: { src: cdnUrl("evl_demons.png"), width: 1200, height: 1019 },
  /** The Element orbs and the wheel that holds them. */
  elements: { src: cdnUrl("evl_elements.png"), width: 1165, height: 1200 },
  /** The six demon tokens on their coloured discs. */
  demonCoins: { src: cdnUrl("evl_demon_coins.png"), width: 1200, height: 666 },
  /**
   * The 2–5 players promo animation, from the game's own social art.
   *
   * The only moving picture on the site: an 11-second GIF, 110 frames, 3.2 MB.
   * Unlike the stills above it ships exactly as delivered — a GIF cannot be
   * resampled without re-encoding all 110 frames, and that weight is the price
   * of the format. A smaller cut would be a new filename here.
   *
   * 870×490, not the 4:3 the drawn rows sit at.
   */
  players: { src: cdnUrl("evl_2to5_players.gif"), width: 870, height: 490 },
} as const;

/**
 * The Team EvL logo — the ritual circle with the wordmark across it.
 *
 * The game's own mark, exported at 500px from `Assets/Logo`, not the square
 * hub card in `cardArt`: that one is cropped to sit in a grid of three next to
 * Habi Sloth, whereas this is the product's name and the page's masthead.
 *
 * Transparent background and outlined lettering, so one file serves both
 * themes — unlike `evlBlooms`, which needs an ink per theme.
 */
export const evlLogo = cdnUrl("evl_ritual_logo.png");

/** The logo's native size — square, so the hero box is reserved before it loads. */
export const EVL_LOGO_SIZE = 500;

/**
 * The blooms flourish that closes the Team EvL page.
 *
 * One drawing in two inks, not one image on two backgrounds: the linework is
 * near-black in `onLight` and white in `onDark`, so neither file can serve the
 * other theme. The page renders both and lets the `dark:` variant hide one —
 * see the closing section of `/teamevl`.
 *
 * Unlike `evlArt` these are live: they are drawn from the game's own
 * `Blooms-Decoration` art, downscaled from 6000px to 2400px wide, which is
 * still twice the widest the page ever shows them.
 */
export const evlBlooms = {
  /** Dark linework, for the light theme. */
  onLight: cdnUrl("evl_blooms_long.png"),
  /** White linework, for the dark theme. */
  onDark: cdnUrl("evl_blooms_long_white.png"),
} as const;

/** The blooms strip's native size, so the row is reserved before it loads. */
export const EVL_BLOOMS_WIDTH = 2400;
export const EVL_BLOOMS_HEIGHT = 300;

/**
 * Team EvL's rulebooks, as PDFs.
 *
 * Downloaded from the Google Drive links the Linktree carries and republished
 * here so the game's own site owns them: Drive interstitials a download, can ask
 * a stranger to sign in, and is not a host we control.
 *
 * The file names are the ones the printed editions go by — `v2` is what ships in
 * the box today, `gc1` the first Game Crafter printing — so the immutable cache
 * is no burden here: a new edition is a new name by definition, and an old one
 * must never change under the people still playing it.
 *
 * Keyed by edition rather than by role: which of these is current is a fact
 * about the editions, and `lib/rulebooks.ts` is where that is settled, along
 * with the order /teamevl/rules lists them in. Adding a printing here without
 * listing it there fails `rulebooks.test.ts`.
 */
export const evlRules = {
  v2: cdnUrl("evl_rules_v2.pdf"),
  gc1: cdnUrl("evl_rules_gc1.pdf"),
} as const;

/**
 * Screenshots of the running app.
 *
 * Captured for the site rather than shipped with the app, but they are still
 * product art, so the CDN is where they belong (plan §6) rather than committed
 * to this public repo.
 *
 * These do **not** take the `site_` prefix the constants above use — the files
 * are named for what they show, as uploaded. The prefix rule exists to keep
 * site chrome clear of the app's `habi_*` namespace; a screenshot is neither.
 *
 * Because `/cdn/**` is immutable, replacing a screenshot means uploading a new
 * filename and changing the constant here. Until a name below is actually live,
 * `AppScreenshot` renders its written stand-in — see the note there on why a
 * missing file cannot be detected any earlier than the browser.
 */
export const habiScreens = {
  /** The home screen: habit editor, weekly goal and pace, and the wheel. */
  home: cdnUrl("tiny_good_deed.png"),
} as const;
