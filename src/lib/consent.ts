/**
 * Cookie-consent decision logic and per-browser persistence.
 *
 * Ported from the app's `sil_common/lib/utils/cookie_consent.dart` and kept
 * close to it (same field names, same version semantics) so both properties
 * behave alike. The two share nothing at runtime.
 *
 * Analytics (`_ga` / `_ga_*`) is the only non-essential storage, and the only
 * thing recorded here.
 *
 * No React and no gtag in this file, which is what makes it directly testable.
 */

/**
 * Bump when the set of cookie categories materially changes; older stored
 * choices then re-prompt. Same idiom as `LEGAL_VERSION`.
 */
export const COOKIE_CONSENT_VERSION = 1;

/** Bare, unlike the app's `flutter.`-prefixed SharedPreferences entry. */
export const CONSENT_STORAGE_KEY = "cookie_consent";

export interface ConsentChoice {
  analyticsGranted: boolean;
  version: number;
  /** Epoch milliseconds. */
  decidedAt: number;
}

/**
 * Rebuilds a choice from stored JSON. Returns null for anything malformed so
 * callers re-prompt. Never throws: this runs in a mount effect, where a throw
 * blanks the page.
 */
export function parseConsentChoice(raw: unknown): ConsentChoice | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { analyticsGranted, version, decidedAt } = raw as Record<
    string,
    unknown
  >;
  if (
    typeof analyticsGranted !== "boolean" ||
    typeof version !== "number" ||
    !Number.isInteger(version) ||
    typeof decidedAt !== "number" ||
    !Number.isInteger(decidedAt)
  ) {
    return null;
  }
  return { analyticsGranted, version, decidedAt };
}

/**
 * Whether the banner must be shown. A version higher than the current constant
 * (shouldn't happen) counts as up to date, so a downgrade cannot re-prompt
 * forever.
 */
export function needsConsent(
  stored: ConsentChoice | null,
  currentVersion: number = COOKIE_CONSENT_VERSION,
): boolean {
  if (stored === null) return true;
  return stored.version < currentVersion;
}

/**
 * Every `localStorage` access here is wrapped: Safari private mode and
 * cookie-blocking extensions throw on the PROPERTY ACCESS itself, not just on
 * `getItem`, so an unguarded read is a crash rather than a miss.
 */
export function readConsent(): ConsentChoice | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === null) return null;
    return parseConsentChoice(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** A storage failure is swallowed: the banner simply asks again. */
export function writeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
  } catch {
    // Storage unavailable — carry on with the in-memory choice.
  }
}

/**
 * The domain scopes GA commonly writes to: the host, its dot-prefixed form,
 * and for a subdomain the registrable parent and its dot-prefixed form. The
 * leading empty string means "no `domain=` attribute", which is how a host-only
 * cookie has to be expired.
 */
export function domainVariants(host: string): string[] {
  const variants = ["", host, `.${host}`];
  const parts = host.split(".");
  if (parts.length > 2) {
    const parent = parts.slice(-2).join(".");
    variants.push(parent, `.${parent}`);
  }
  return variants;
}

/**
 * Best-effort expiry of GA cookies on withdrawal, across every domain variant.
 * A cookie the browser will not let us touch is skipped; EU guidance expects
 * best effort, not a guarantee.
 */
export function expireAnalyticsCookies(): void {
  const host = window.location.hostname;
  const domains = domainVariants(host);
  for (const raw of document.cookie.split(";")) {
    const name = raw.split("=")[0]?.trim();
    if (name === undefined) continue;
    if (name !== "_ga" && !name.startsWith("_ga_")) continue;
    for (const domain of domains) {
      const domainAttr = domain === "" ? "" : `; domain=${domain}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainAttr}`;
    }
  }
}
