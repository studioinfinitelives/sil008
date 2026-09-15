import type { Route } from "next";
import { currentRulebook } from "@/lib/rulebooks";

/**
 * Everything the Team EvL Linktree points at.
 *
 * RENDERED TWICE on /teamevl: as `TeamEvlLinks` at the foot of the page and in
 * the pull-tab drawer. The list lives here so the two cannot drift — a new
 * destination is one entry below and appears in both.
 *
 * `Route` on internal destinations means `typedRoutes` fails `tsc` on a typo
 * rather than shipping a dead link.
 */
export type EvlLink =
  | { kind: "route"; href: Route; label: string }
  | { kind: "external"; href: string; label: string };

export const EVL_BUY_URL = "https://www.thegamecrafter.com/games/team-evl";

export const EVL_VIDEO_URL = "https://youtu.be/ecXGyscPgWw";

export const evlLinks: readonly EvlLink[] = [
  { kind: "external", href: EVL_BUY_URL, label: "Buy Online" },
  {
    kind: "external",
    href: currentRulebook.url,
    label: "Current Rules (PDF)",
  },
  { kind: "route", href: "/teamevl/rules", label: "Rules Archive" },
  { kind: "route", href: "/teamevl/howtoplay", label: "How To Play" },
  { kind: "external", href: EVL_VIDEO_URL, label: "Video Tutorial" },
  {
    kind: "external",
    href: "https://boardgamegeek.com/boardgame/228575/team-evl",
    label: "Leave a Review",
  },
  { kind: "external", href: "https://discord.gg/zrSg2CfKGS", label: "Discord" },
];

/** The list minus the page being rendered. Passing nothing keeps every entry. */
export function evlLinksExcept(omit?: Route): readonly EvlLink[] {
  return omit ? evlLinks.filter((item) => item.href !== omit) : evlLinks;
}
