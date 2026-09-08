import { describe, expect, it } from "vitest";
import { evlLinks, evlLinksExcept } from "@/lib/evlLinks";
import { currentRulebook } from "@/lib/rulebooks";

/**
 * Guards the one list both Team EvL link renderings read.
 *
 * The page shows these destinations twice — the nav that closes it and the side
 * drawer behind the pull tab — so an entry that is wrong is wrong in two places
 * at once, and a destination added to only one of them is the bug this module
 * exists to make impossible.
 */

describe("evlLinks", () => {
  it("points at whatever edition is current, not a pinned file", () => {
    const rules = evlLinks.find((item) => item.label === "Current Rules (PDF)");
    expect(rules?.href).toBe(currentRulebook.url);
  });

  it("names every destination exactly once", () => {
    const hrefs = evlLinks.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);

    const labels = evlLinks.map((item) => item.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("routes internal destinations and leaves the rest absolute", () => {
    for (const item of evlLinks) {
      if (item.kind === "route") {
        expect(item.href.startsWith("/")).toBe(true);
      } else {
        expect(item.href.startsWith("https://")).toBe(true);
      }
    }
  });

  it("labels every entry", () => {
    for (const item of evlLinks) {
      expect(item.label.length).toBeGreaterThan(0);
    }
  });
});

describe("evlLinksExcept", () => {
  it("keeps every destination when nothing is omitted", () => {
    expect(evlLinksExcept()).toEqual(evlLinks);
  });

  it("drops the page being rendered", () => {
    const trimmed = evlLinksExcept("/teamevl/rules");
    expect(trimmed).toHaveLength(evlLinks.length - 1);
    expect(trimmed.some((item) => item.href === "/teamevl/rules")).toBe(false);
  });

  it("leaves the list alone when the page is not in it", () => {
    expect(evlLinksExcept("/teamevl")).toEqual(evlLinks);
  });
});
