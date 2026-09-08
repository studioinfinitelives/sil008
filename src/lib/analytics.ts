import { expireAnalyticsCookies } from "@/lib/consent";
import { GA_MEASUREMENT_ID } from "@/lib/site";

/**
 * The one place gtag.js is touched.
 *
 * Strict opt-in: nothing is fetched from googletagmanager.com, no `dataLayer`
 * exists and no cookie is written until {@link setAnalyticsConsent} is called
 * with `true`. That is why this is hand-rolled rather than `next/script` or
 * `@next/third-parties` — both put the tag in the page before anyone has
 * agreed to it, which is the exact thing the consent gate exists to prevent.
 *
 * With an empty {@link GA_MEASUREMENT_ID} every function here is a no-op and
 * `SiteAnalytics` renders nothing, so the site behaves as if this file did not
 * exist.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    /** GA's documented kill switch — see {@link setAnalyticsConsent}. */
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

/** False when the site ships without a measurement ID: the whole feature is off. */
export function isAnalyticsConfigured(): boolean {
  return GA_MEASUREMENT_ID !== "";
}

// Annotated so the template stays a template-literal type: `GA_MEASUREMENT_ID`
// is a plain `string`, so without this the key would widen and stop matching the
// `Window` index signature above.
const DISABLE_FLAG: `ga-disable-${string}` = `ga-disable-${GA_MEASUREMENT_ID}`;

let loaded = false;

/**
 * Injects gtag.js and puts it in its denied-by-default consent state.
 *
 * Idempotent — a second call after the visitor re-opens their preferences must
 * not add a second tag.
 */
function loadGtag(): void {
  if (loaded) return;
  loaded = true;

  window.dataLayer ??= [];
  // The canonical Google shim, verbatim: a function declaration that pushes its
  // own `arguments` object. An arrow pushing a rest array looks equivalent and
  // is not — gtag.js reads the pushed values as an arguments-like object.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  } as Window["gtag"];

  // Denied before anything else runs, mirroring sil006/web/index.html. The ad
  // signals are never granted anywhere in this codebase.
  window.gtag?.("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  window.gtag?.("js", new Date());
  // `send_page_view: false` is load-bearing: `config` otherwise fires its own
  // page_view on load, and `trackPageView` fires one for the same landing page
  // a moment later. The duplicate is invisible in DebugView unless looked for.
  window.gtag?.("config", GA_MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

/**
 * Applies a consent decision.
 *
 * On a grant the tag is loaded and `analytics_storage` flipped. Advertising
 * signals are deliberately *not* re-sent: they stay denied from the defaults.
 *
 * On a refusal, `window['ga-disable-<ID>'] = true` is what actually stops
 * collection. Consent Mode alone does not — with `analytics_storage: denied`
 * gtag.js still sends cookieless pings, and the disable flag is the documented
 * way to stop them.
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

/** Sends one GA4 event. A no-op until the tag has been loaded by a grant. */
export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean>,
): void {
  if (!isAnalyticsConfigured()) return;
  window.gtag?.("event", name, params);
}

/**
 * Sends a page view.
 *
 * Fired by hand for every route, including the first: `gtag('config')` sends
 * exactly one page_view on load and Next's client router never triggers
 * another, so without this only landing pages would ever be counted.
 *
 * `page_location` comes from `window.location.href` rather than being rebuilt
 * from the route — Hosting serves this export with `cleanUrls`, so the URL a
 * visitor is actually on is the only correct answer.
 */
export function trackPageView(): void {
  trackEvent("page_view", {
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
  });
}
