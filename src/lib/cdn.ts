/**
 * CDN asset URLs.
 *
 * Files live in this repo's `cdn/` and are published by `make deploy-cdn`,
 * separately from the site. No product art is committed outside `cdn/`: this
 * repo is public and the artwork is not under its MIT licence.
 *
 * INVARIANT: the host serves a one-year immutable cache, so a file can never be
 * replaced in place. New art means a new filename AND a changed constant here.
 *
 * Server-only. Every importer is a server component, so the host is baked into
 * the exported HTML and never reaches the client bundle.
 */

/**
 * Deliberately not the app's `cdn.habisloth.app`. A Hosting deploy replaces a
 * whole site atomically, so hotlinking the app's CDN would let a sil006 art
 * deploy break these pages. Shared art is copied into `cdn/` instead.
 */
const CDN_HOST = "https://cdn.infinitelives.io";

export function cdnUrl(fileName: string): string {
  return `${CDN_HOST}/${fileName}`;
}

export const logoUrl = cdnUrl("site_infinitelives_logo.svg");

/** "Our Creations" cards on the hub. */
export const cardArt = {
  teamevl: cdnUrl("site_card_teamevl.png"),
  habisloth: cdnUrl("site_card_habisloth.png"),
  comingSoon: cdnUrl("site_card_pbnk.svg"),
} as const;

/**
 * Habi Sloth illustrations — byte-identical COPIES of `sil006/cdn/`, not
 * hotlinks (see `CDN_HOST`). A recrop upstream has to be carried across by
 * hand; `cdn.test.ts` fails on drift when `../sil006` is checked out.
 *
 * Names are the app's, so they keep its `habi_*` prefix.
 */
export const habiArt = {
  calendar: cdnUrl("habi_calendar.png"),
  friends: cdnUrl("habi_friends.png"),
  beach: cdnUrl("habi_beach.png"),
  weights: cdnUrl("habi_weights.png"),
  week: cdnUrl("habi_week.png"),
  idea: cdnUrl("habi_idea_wide.png"),
  points: cdnUrl("habi_points.png"),
} as const;

/**
 * Team EvL illustrations.
 *
 * Each entry carries its own pixel size because `next/image` is unoptimized
 * site-wide: the numbers only reserve the layout box, so they must match the
 * uploaded file or the row resizes as the art arrives. `cdn.test.ts` reads the
 * real dimensions out of the file headers and fails on a mismatch.
 *
 * `demons` and `demonCoins` are staged art that no page currently renders.
 */
export const evlArt = {
  hero: { src: cdnUrl("evl_hero.png"), width: 1600, height: 600 },
  cards: { src: cdnUrl("evl_cards.png"), width: 1200, height: 640 },
  tokens: { src: cdnUrl("evl_tokens.png"), width: 1200, height: 778 },
  ritualCards: {
    src: cdnUrl("evl_ritual_cards.png"),
    width: 1200,
    height: 1021,
  },
  demons: { src: cdnUrl("evl_demons.png"), width: 1200, height: 1019 },
  elements: { src: cdnUrl("evl_elements.png"), width: 1165, height: 1200 },
  demonCoins: { src: cdnUrl("evl_demon_coins.png"), width: 1200, height: 666 },
  /**
   * The `_drawn` suffix is historical: this replaced a photograph of the same
   * scene. The suffix stays because the immutable cache means the old name can
   * never be reused.
   */
  travelBag: {
    src: cdnUrl("evl_travel_bag_drawn.png"),
    width: 1159,
    height: 896,
  },
  /**
   * GIFs ship exactly as delivered: one cannot be resampled without re-encoding
   * every frame. A smaller cut would be a new filename.
   */
  players: { src: cdnUrl("evl_2to5_players.gif"), width: 870, height: 490 },
  /** /teamevl/howtoplay. */
  playersBanner: {
    src: cdnUrl("evl_howtoplay_players_banner.webp"),
    width: 3000,
    height: 666,
  },
  yourTurn: {
    src: cdnUrl("evl_howtoplay_your_turn.jpg"),
    width: 2048,
    height: 1152,
  },
  howToWin: { src: cdnUrl("evl_howtoplay_win.gif"), width: 1000, height: 600 },
  play: { src: cdnUrl("evl_howtoplay_play.gif"), width: 1000, height: 400 },
  peek: { src: cdnUrl("evl_howtoplay_peek.gif"), width: 1000, height: 400 },
  draw: { src: cdnUrl("evl_howtoplay_draw.gif"), width: 1000, height: 400 },
  heal: { src: cdnUrl("evl_howtoplay_heal.gif"), width: 1000, height: 400 },
} as const;

/** The game's own mark. Currently unrendered; `cardArt.teamevl` is the hub card. */
export const evlLogo = cdnUrl("evl_ritual_logo.png");

export const EVL_LOGO_SIZE = 500;

/**
 * One drawing in two inks, not one image on two backgrounds — neither file can
 * serve the other theme. /teamevl renders both and lets a `dark:` variant hide
 * one, because a static export cannot know the theme at build time.
 */
export const evlBlooms = {
  /** Dark linework, for the light theme. */
  onLight: cdnUrl("evl_blooms_long.png"),
  /** White linework, for the dark theme. */
  onDark: cdnUrl("evl_blooms_long_white.png"),
} as const;

export const EVL_BLOOMS_WIDTH = 2400;
export const EVL_BLOOMS_HEIGHT = 300;

/**
 * Rulebook PDFs, keyed by edition. Which one is current is decided in
 * `lib/rulebooks.ts`; adding a printing here without listing it there fails
 * `rulebooks.test.ts`.
 */
export const evlRules = {
  v2: cdnUrl("evl_rules_v2.pdf"),
  gc1: cdnUrl("evl_rules_gc1.pdf"),
} as const;

/**
 * App screenshots. Until a name here is actually live on the CDN,
 * `AppScreenshot` renders a written stand-in — the host answers a missing file
 * with `200 text/html`, so only the browser can detect one.
 */
export const habiScreens = {
  home: cdnUrl("tiny_good_deed.png"),
} as const;
