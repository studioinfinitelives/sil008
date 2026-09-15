import { describe, expect, it } from "vitest";
import {
  EVL_BUY_URL,
  EVL_VIDEO_URL,
  evlLinks,
  evlLinksExcept,
} from "@/lib/evlLinks";
import { currentRulebook } from "@/lib/rulebooks";

/**
 * Guards the one list both Team EvL link renderings read. The page shows these
 * destinations twice, so a wrong entry is wrong in two places at once.
 */

describe("evlLinks", () => {
  it("points at whatever edition is current, not a pinned file", () => {
    const rules = evlLinks.find((item) => item.label === "Current Rules (PDF)");
    expect(rules?.href).toBe(currentRulebook.url);
  });

  it("sends How To Play to the page and keeps the video beside it", () => {
    const byLabel = (label: string) =>
      evlLinks.find((item) => item.label === label);
    expect(byLabel("How To Play")).toEqual({
      kind: "route",
      href: "/teamevl/howtoplay",
      label: "How To Play",
    });
    expect(byLabel("Video Tutorial")?.href).toBe(EVL_VIDEO_URL);
    expect(byLabel("Buy Online")?.href).toBe(EVL_BUY_URL);
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
