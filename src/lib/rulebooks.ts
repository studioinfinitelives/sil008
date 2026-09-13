import { evlRules } from "@/lib/cdn";

/**
 * Every printed edition of the Team EvL rules. The PDFs are URLs in
 * `lib/cdn.ts`; this is the editorial half — names, notes, and which is current.
 *
 * THE DECLARED ORDER IS THE RENDERED ORDER, newest first. Declared rather than
 * sorted so the list reads the way it renders; `rulebooks.test.ts` fails if a
 * new edition is appended at the bottom instead of added at the top.
 */

export interface Rulebook {
  /**
   * The sort key, counting up as editions ship. The file names (`v2`, `gc1`)
   * are historical and do not sort.
   */
  version: number;
  title: string;
  /**
   * Optional one-line note on which box this edition is for. Empty on both
   * today; /teamevl/rules omits the line entirely rather than rendering an
   * empty paragraph.
   */
  note: string;
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
 * The head of the list, by definition. Everything linking to "the rules" reads
 * this, so a new printing is one entry at the top and nothing else. The
 * non-empty tuple type above makes this index safe under
 * `noUncheckedIndexedAccess`.
 */
export const currentRulebook: Rulebook = rulebooks[0];
