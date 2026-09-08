import { evlRules } from "@/lib/cdn";

/**
 * Every printed edition of the Team EvL rules, newest first.
 *
 * The PDFs themselves are URLs in `lib/cdn.ts`; this is the editorial half —
 * what each printing is called, who it is for, and which one is current. Both
 * halves are needed to render /teamevl/rules, and neither belongs in the page:
 * a second edition is a fact about the game, not about a layout.
 *
 * **The order here is the order the page shows.** Newest at the top, because
 * the visitor who wants the current rules is the common case and the archive is
 * for the minority still holding an older box. It is declared rather than
 * sorted so the list reads the way it renders — `rulebooks.test.ts` fails if a
 * new edition is appended at the bottom instead of added at the top.
 */

export interface Rulebook {
  /**
   * The printing's number, counting up as editions ship. The sort key, and the
   * only thing in here that orders the list — the file names (`v2`, `gc1`) are
   * historical and do not sort.
   */
  version: number;
  /** What the edition is called on the page. */
  title: string;
  /**
   * Which box this one is for, in a line. Empty is allowed and is the state
   * both editions are in today: the title and the "Current" badge already say
   * which printing a row is, so this is only for the edition that needs a word
   * of explanation. /teamevl/rules leaves the line out entirely when it is
   * blank rather than rendering an empty paragraph.
   */
  note: string;
  /** The PDF, on the studio CDN. */
  url: string;
}

export const rulebooks = [
  {
    version: 2,
    title: "Team EvL v2",
    note: "",
    url: evlRules.v2,
  },
  {
    version: 1,
    title: "Team EvL v1",
    note: "",
    url: evlRules.gc1,
  },
] as const satisfies readonly [Rulebook, ...Rulebook[]];

/**
 * The edition in the box today — the head of the list, by definition.
 *
 * Everything that links to "the rules" reads this, so a new printing is one
 * entry at the top of `rulebooks` and nothing else. The non-empty tuple type
 * above is what makes this index safe under `noUncheckedIndexedAccess`.
 */
export const currentRulebook: Rulebook = rulebooks[0];
