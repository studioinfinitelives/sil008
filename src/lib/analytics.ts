import { expireAnalyticsCookies } from "@/lib/consent";
import { GA_MEASUREMENT_ID } from "@/lib/site";

/**
 * The only place gtag.js is touched.
 *
 * Hand-rolled rather than `next/script` or `@next/third-parties`: both inject
 * the tag before consent is given, which defeats the gate. Nothing is fetched,
 * no `dataLayer` exists and no cookie is written until `setAnalyticsConsent` is
 * called with `true`.
 *
 * With an empty `GA_MEASUREMENT_ID` every function is a no-op.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    /** GA's kill switch — see `setAnalyticsConsent`. */
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export function isAnalyticsConfigured(): boolean {
  return GA_MEASUREMENT_ID !== "";
}

// Annotated to keep the template-literal type: `GA_MEASUREMENT_ID` is a plain
// `string`, so without this the key widens and stops matching the index
// signature above.
const DISABLE_FLAG: `ga-disable-${string}` = `ga-disable-${GA_MEASUREMENT_ID}`;

let loaded = false;

/** Injects gtag.js in its denied-by-default state. Idempotent. */
function loadGtag(): void {
  if (loaded) return;
  loaded = true;

  window.dataLayer ??= [];
  // Google's shim verbatim: a function declaration pushing its own `arguments`.
  // An arrow pushing a rest array is NOT equivalent — gtag.js reads the pushed
  // value as an arguments-like object.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  } as Window["gtag"];

  window.gtag?.("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  window.gtag?.("js", new Date());
  // `send_page_view: false` is load-bearing: `config` otherwise fires its own
  // page_view on load and `trackPageView` fires a second for the same page.
  window.gtag?.("config", GA_MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

/**
 * Applies a consent decision. Ad signals are never re-sent; they stay denied.
 *
 * On refusal the `ga-disable-<ID>` flag is what actually stops collection.
 * Consent Mode alone does not: with `analytics_storage: denied` gtag.js still
 * sends cookieless pings.
 */
export function setAnalyticsConsent(granted: boolean): void {
  if (!isAnalyticsConfigured()) return;

  if (granted) {
    window[DISABLE_FLAG] = false;
    loadGtag();
    window.gtag?.("consent", "update", { analytics_storage: "granted" });
    return;
  }

  window[DISABLE_FLAG] = true;
  if (loaded) {
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
  }
  expireAnalyticsCookies();
}

/** Sends one GA4 event. A no-op until a grant has loaded the tag. */
export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean>,
): void {
  if (!isAnalyticsConfigured()) return;
  window.gtag?.("event", name, params);
}

/**
 * Fired by hand for every route including the first, since `config` is
 * configured not to send one and Next's client router never triggers another.
 *
 * `page_location` comes from `window.location.href` rather than the route:
 * Hosting serves this export with `cleanUrls`, so the live URL is the only
 * correct answer.
 */
export function trackPageView(): void {
  trackEvent("page_view", {
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
  });
}
