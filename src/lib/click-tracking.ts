/**
 * Turns a clicked element into the event that should be reported for it.
 *
 * Delegated auto-capture is the whole point: one listener on `document` (see
 * `SiteAnalytics`) describes every link and button on the site, so the twenty-odd
 * existing components stay server components and nothing has to be instrumented
 * by hand. Two escape hatches exist for the cases the derived answer gets wrong:
 *
 * - `data-analytics-id` overrides the label, for the three places that render
 *   the same button text twice on one page.
 * - `data-analytics-area` overrides the area, for the same reason.
 * - `data-analytics="off"` anywhere up the tree suppresses the event entirely —
 *   which is how the consent UI keeps itself out of the reports it is granting
 *   permission for.
 *
 * No DOM listeners and no gtag in here: it takes an element and returns a
 * description, which is what makes it testable.
 */

/** GA4 drops the whole event if any parameter value is longer than this. */
const MAX_PARAM_LENGTH = 100;

/** Elements that count as a click target, in `closest()` order. */
const CLICKABLE = "a[href], button, [role='button']";

/** Landmarks whose tag name is a good enough name for "where on the page". */
const AREA_TAGS = new Set([
  "header",
  "footer",
  "nav",
  "main",
  "article",
  "section",
]);

export interface ClickDescription {
  name: "link_click" | "button_click";
  params: {
    label: string;
    area: string;
    link_url?: string;
    outbound?: boolean;
  };
}

export function describeClickTarget(
  target: Element,
  currentHost: string,
): ClickDescription | null {
  const element = target.closest(CLICKABLE);
  if (element === null) return null;
  if (element.closest('[data-analytics="off"]') !== null) return null;

  const params: ClickDescription["params"] = {
    label: deriveLabel(element),
    area: deriveArea(element),
  };

  // `closest("a[href]")` can match an ancestor of a nested button, so check the
  // element we actually found rather than assuming it is the anchor.
  if (element instanceof HTMLAnchorElement) {
    params.link_url = truncate(element.href);
    // `hostname` is empty for mailto: and tel:, which never point at this site.
    params.outbound = element.hostname !== currentHost;
    return { name: "link_click", params };
  }

  return { name: "button_click", params };
}

/**
 * The most human-readable name available, in order of how deliberate it is:
 * an explicit override, then an accessible name, then what the visitor read.
 */
function deriveLabel(element: Element): string {
  const candidates = [
    element.getAttribute("data-analytics-id"),
    element.getAttribute("aria-label"),
    element.textContent?.replace(/\s+/g, " ").trim(),
    element.getAttribute("title"),
    element instanceof HTMLAnchorElement ? element.pathname : undefined,
  ];

  for (const candidate of candidates) {
    if (candidate !== undefined && candidate !== null && candidate !== "") {
      return truncate(candidate);
    }
  }
  return "unlabelled";
}

/** Which part of the page the click sat in — the report's second dimension. */
function deriveArea(element: Element): string {
  const tagged = element.closest("[data-analytics-area]");
  const area = tagged?.getAttribute("data-analytics-area");
  if (area !== undefined && area !== null && area !== "") {
    return truncate(area);
  }

  for (
    let node: Element | null = element;
    node !== null;
    node = node.parentElement
  ) {
    const tag = node.tagName.toLowerCase();
    if (AREA_TAGS.has(tag)) return tag;
  }
  return "page";
}

function truncate(value: string): string {
  return value.length > MAX_PARAM_LENGTH
    ? value.slice(0, MAX_PARAM_LENGTH)
    : value;
}
