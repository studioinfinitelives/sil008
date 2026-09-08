/**
 * Cookie-consent decision logic and per-browser persistence.
 *
 * A port of the Habi Sloth web app's `sil_common/lib/utils/cookie_consent.dart`
 * and `cookie_cleanup_web.dart`, kept deliberately close to it: the same field
 * names, the same version semantics, the same best-effort cookie expiry. The two
 * properties are separate origins and share nothing at runtime — the shape is
 * mirrored so that anyone who uses both meets the *same behaviour*, not so that
 * a stored choice can travel between them.
 *
 * Everything the site stores is essential except the Google Analytics
 * (`_ga` / `_ga_*`) cookies, which under EU ePrivacy rules require prior
 * opt-in. That analytics choice is the only thing recorded here.
 *
 * No React and no gtag in this file — it is pure enough to test directly, which
 * `consent.test.ts` does.
 */

/**
 * Bump when the set of cookie/storage categories materially changes; any stored
 * choice from an older version then re-prompts rather than being assumed to
 * still apply (the same idiom as `LEGAL_VERSION` in `lib/legal.ts`).
 */
export const COOKIE_CONSENT_VERSION = 1;

/** localStorage key. Bare, unlike the app's `flutter.`-prefixed SharedPreferences entry. */
export const CONSENT_STORAGE_KEY = "cookie_consent";

/**
 * A per-browser cookie-consent decision. Keyed by nothing user-specific, so it
 * applies to the browser and survives across visits.
 */
export interface ConsentChoice {
  analyticsGranted: boolean;
  version: number;
  /** Epoch milliseconds. */
  decidedAt: number;
}

/**
 * Rebuilds a choice from stored JSON, or returns null for anything
 * malformed or legacy so callers re-prompt instead of crashing. A corrupt blob
 * is a re-prompt, never an exception — this runs in a mount effect, and a throw
 * there blanks the page.
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
 * Whether the consent banner must be shown: true when there is no decision yet,
 * or one recorded under an older consent version. A version higher than the
 * current constant (shouldn't happen) is treated as up to date.
 */
export function needsConsent(
  stored: ConsentChoice | null,
  currentVersion: number = COOKIE_CONSENT_VERSION,
): boolean {
  if (stored === null) return true;
  return stored.version < currentVersion;
}

/**
 * Reads the stored choice, or null if there is none or it cannot be read.
 *
 * Every `localStorage` access here is wrapped: Safari's private mode and
 * cookie-blocking extensions throw on the property access itself, not just on
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

/** Persists a choice. A storage failure is swallowed: the banner will simply ask again. */
export function writeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
  } catch {
    // Storage unavailable — nothing to do but carry on with the in-memory choice.
  }
}

/**
 * Host itself, dot-prefixed host, and (for sub.example.com) the registrable
 * parent and its dot-prefixed form — the domain scopes GA commonly uses. The
 * leading empty string means "no `domain=` attribute at all", which is how a
 * host-only cookie has to be expired.
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
 * Best-effort expiry of Google Analytics (`_ga`, `_ga_*`) cookies when the user
 * withdraws consent. GA sets these on the current host and often on a
 * dot-prefixed registrable domain, so we expire across every variant. Any cookie
 * the browser will not let us touch is simply skipped — EU guidance expects a
 * best-effort removal, not a guarantee.
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
