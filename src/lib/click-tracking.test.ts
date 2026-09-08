/**
 * @vitest-environment-options { "url": "https://infinitelives.io/" }
 */
import { beforeEach, describe, expect, it } from "vitest";
import { describeClickTarget } from "@/lib/click-tracking";

/**
 * Delegated capture means these derivations run against markup nobody wrote for
 * analytics, so the cases that matter are the awkward ones: a click landing on
 * an icon inside a button, a label long enough for GA4 to drop the event, and
 * the consent UI opting itself out.
 *
 * The docblock above puts jsdom on the real origin so a relative `href` resolves
 * the way it does on the site — otherwise every internal link on the page would
 * look outbound next to jsdom's default `localhost`.
 */

const HOST = "infinitelives.io";

/** Builds the given markup and returns the element matching `selector`. */
function render(html: string, selector: string): Element {
  document.body.innerHTML = html;
  const element = document.body.querySelector(selector);
  if (element === null) throw new Error(`No element matched ${selector}`);
  return element;
}

const describeIn = (html: string, selector: string) =>
  describeClickTarget(render(html, selector), HOST);

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("describeClickTarget", () => {
  it("reads a button's own wording as its label", () => {
    expect(describeIn("<button>Accept all</button>", "button")).toEqual({
      name: "button_click",
      params: { label: "Accept all", area: "page" },
    });
  });

  it("prefers data-analytics-id over aria-label over text", () => {
    const html = `<button data-analytics-id="explicit" aria-label="accessible">visible</button>`;
    expect(describeIn(html, "button")?.params.label).toBe("explicit");
    expect(
      describeIn(`<button aria-label="accessible">visible</button>`, "button")
        ?.params.label,
    ).toBe("accessible");
  });

  it("collapses whitespace in text content", () => {
    const html = "<button>\n  Download\n  PDF\n</button>";
    expect(describeIn(html, "button")?.params.label).toBe("Download PDF");
  });

  // GA4 drops the whole event when a parameter runs past 100 characters.
  it("truncates a long label to exactly 100 characters", () => {
    const label = "x".repeat(140);
    const result = describeIn(`<button>${label}</button>`, "button");
    expect(result?.params.label).toHaveLength(100);
  });

  it("marks a same-host link as internal and records where it went", () => {
    const result = describeIn(`<a href="/teamevl">Team EvL</a>`, "a");
    expect(result).toEqual({
      name: "link_click",
      params: {
        label: "Team EvL",
        area: "page",
        link_url: "https://infinitelives.io/teamevl",
        outbound: false,
      },
    });
  });

  it("marks a link to another host as outbound", () => {
    const html = `<a href="https://www.thegamecrafter.com/games/team-evl">Buy</a>`;
    expect(describeIn(html, "a")?.params.outbound).toBe(true);
  });

  it("treats mailto: as outbound", () => {
    const html = `<a href="mailto:hello@infinitelives.io">Contact</a>`;
    expect(describeIn(html, "a")?.params.outbound).toBe(true);
  });

  it("falls back to a link's path when it has no words of its own", () => {
    const html = `<a href="/teamevl/rules"><svg></svg></a>`;
    expect(describeIn(html, "a")?.params.label).toBe("/teamevl/rules");
  });

  // The ThemeToggle case: the click lands on the icon, not the control.
  it("resolves a click inside a button to the button", () => {
    const html = "<button aria-label=Theme><svg></svg></button>";
    const result = describeClickTarget(render(html, "svg"), HOST);
    expect(result).toEqual({
      name: "button_click",
      params: { label: "Theme", area: "page" },
    });
  });

  it("ignores anything under data-analytics=off", () => {
    const html = `<div data-analytics="off"><button>Essential only</button></div>`;
    expect(describeIn(html, "button")).toBeNull();
  });

  it("ignores a click that is not on a control", () => {
    expect(describeIn("<p>just prose</p>", "p")).toBeNull();
  });
});

describe("area", () => {
  it("prefers the nearest data-analytics-area", () => {
    const html = `<footer><div data-analytics-area="hero"><button>Buy</button></div></footer>`;
    expect(describeIn(html, "button")?.params.area).toBe("hero");
  });

  it("falls back to the enclosing landmark", () => {
    const html = "<footer><button>Privacy</button></footer>";
    expect(describeIn(html, "button")?.params.area).toBe("footer");
  });

  it("uses the innermost landmark when they nest", () => {
    const html = "<main><section><button>Buy</button></section></main>";
    expect(describeIn(html, "button")?.params.area).toBe("section");
  });

  it("falls back to page when there is no landmark at all", () => {
    expect(
      describeIn("<div><button>Buy</button></div>", "button")?.params.area,
    ).toBe("page");
  });
});
