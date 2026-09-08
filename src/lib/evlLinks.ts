import type { Route } from "next";
import { currentRulebook } from "@/lib/rulebooks";

/**
 * Everything the Team EvL Linktree points at.
 *
 * The page is written to replace that Linktree, so it carries all of its
 * destinations rather than a store link alone — once this is live the Linktree
 * can be reduced to a single link back here.
 *
 * This list is rendered twice on /teamevl: once as the nav that closes the page
 * ({@link "@/app/teamevl/_components/TeamEvlLinks"}) and once in the side
 * drawer the pull tab opens. It lives here rather than in either component so
 * the two cannot drift — a new destination is one entry below and shows up in
 * both, the way a new printing is one entry in `rulebooks`.
 *
 * Both rulebook entries used to be Google Drive links. They now point at the
 * studio's own copies: the archive is a page here, and the current rules are
 * the PDF on the studio CDN that every "Download Rules" button already serves.
 * Drive interstitials a download and can ask a stranger to sign in — see the
 * note on `evlRules`.
 *
 * The rest are genuinely off-site, so they stay plain anchors. Internal
 * destinations are typed as `Route`, which with `typedRoutes` on means a typo
 * fails `tsc` rather than shipping a dead link.
 */
export type EvlLink =
  | { kind: "route"; href: Route; label: string }
  | { kind: "external"; href: string; label: string };

export const evlLinks: readonly EvlLink[] = [
  {
    kind: "external",
    href: "https://www.thegamecrafter.com/games/team-evl",
    label: "Buy Online",
  },
  {
    kind: "external",
    href: currentRulebook.url,
    label: "Current Rules (PDF)",
  },
  { kind: "route", href: "/teamevl/rules", label: "Rules Archive" },
  {
    kind: "external",
    href: "https://youtu.be/ecXGyscPgWw",
    label: "How To Play",
  },
  {
    kind: "external",
    href: "https://boardgamegeek.com/boardgame/228575/team-evl",
    label: "Leave a Review",
  },
  { kind: "external", href: "https://discord.gg/zrSg2CfKGS", label: "Discord" },
];

/**
 * The list minus the page currently being rendered, if it is in the list.
 *
 * A link to the page you are already on is noise, so /teamevl/rules drops its
 * own entry. Passing nothing keeps every destination.
 */
export function evlLinksExcept(omit?: Route): readonly EvlLink[] {
  return omit ? evlLinks.filter((item) => item.href !== omit) : evlLinks;
}
