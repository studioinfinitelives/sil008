import { describe, expect, it } from "vitest";
import { evlRules } from "@/lib/cdn";
import { currentRulebook, rulebooks } from "@/lib/rulebooks";

/**
 * Guards the rules archive's two promises.
 *
 * **The order is newest first.** /teamevl/rules renders `rulebooks` in the
 * order it is declared, so the ordering has to be checked here rather than
 * trusted — appending a third edition at the bottom of the list would otherwise
 * quietly bury the current rules under an old printing.
 *
 * **Nothing published is missing from it.** A rulebook PDF on the CDN that no
 * page lists is a download nobody can find; `cdn.test.ts` proves every URL has
 * a file, and this proves every file has a row.
 */

describe("rulebooks", () => {
  it("is ordered by version, newest first", () => {
    const versions = rulebooks.map((book) => book.version);
    expect(versions).toEqual([...versions].sort((a, b) => b - a));
  });

  it("gives each edition its own version number", () => {
    const versions = rulebooks.map((book) => book.version);
    expect(new Set(versions).size).toBe(versions.length);
  });

  it("lists every rulebook the CDN publishes, exactly once", () => {
    // Both sides are freshly built arrays, so sorting them in place is safe.
    const listed = rulebooks.map((book) => book.url);
    expect(listed.sort()).toEqual(Object.values(evlRules).sort());
  });

  it("treats the newest edition as the current one", () => {
    expect(currentRulebook).toBe(rulebooks[0]);
    // The edition in the box today, spelled out: this is what every "Download
    // Rules" button on the site resolves to.
    expect(currentRulebook.url).toBe(evlRules.v2);
  });

  it("names every edition", () => {
    // The title only. `note` is optional copy and is blank on both editions
    // today — the page renders it when there is something to say and shows
    // nothing when there is not, so an empty one is not a fault.
    for (const book of rulebooks) {
      expect(book.title.length).toBeGreaterThan(0);
    }
  });
});
