/**
 * Turns a clicked element into the event to report for it.
 *
 * Delegated auto-capture: one listener on `document` (see `SiteAnalytics`)
 * describes every link and button, so the components stay server components and
 * nothing is instrumented by hand. Three opt-out/override hooks:
 *
 * - `data-analytics-id` overrides the label.
 * - `data-analytics-area` overrides the area.
 * - `data-analytics="off"` anywhere up the tree suppresses the event, which is
 *   how the consent UI stays out of the reports it is granting permission for.
 *
 * No DOM listeners and no gtag here — it takes an element and returns a
 * description, which is what makes it testable.
 */

/** GA4 drops the whole event if any parameter value exceeds this. */
const MAX_PARAM_LENGTH = 100;

const CLICKABLE = "a[href], button, [role='button']";

/** Landmarks whose tag name is a good enough "where on the page". */
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

  // `closest("a[href]")` can match an ancestor of a nested button, so test what
  // was actually found rather than assuming it is the anchor.
  if (element instanceof HTMLAnchorElement) {
    params.link_url = truncate(element.href);
    // `hostname` is empty for mailto: and tel:, which never point at this site.
    params.outbound = element.hostname !== currentHost;
    return { name: "link_click", params };
  }

  return { name: "button_click", params };
}

/**
 * Most human-readable name available, in order of how deliberate it is:
 * explicit override, accessible name, visible text, tooltip, then for a link
 * with none of those, its path. An icon-only anchor reaches the last one.
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
