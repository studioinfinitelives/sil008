"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CookieBanner } from "@/components/analytics/CookieBanner";
import { CookiePreferences } from "@/components/analytics/CookiePreferences";
import {
  isAnalyticsConfigured,
  setAnalyticsConsent,
  trackEvent,
  trackPageView,
} from "@/lib/analytics";
import {
  COOKIE_CONSENT_VERSION,
  type ConsentChoice,
  needsConsent,
  readConsent,
  writeConsent,
} from "@/lib/consent";
import { describeClickTarget } from "@/lib/click-tracking";

/** The event the footer button dispatches; see `CookiePreferencesButton`. */
export const OPEN_PREFERENCES_EVENT = "sil:cookie-preferences";

/**
 * The site's one analytics client component, mounted once from the root layout.
 *
 * Owns the whole feature: stored consent, the banner, the preferences dialog,
 * per-route page views, the delegated click listener. Nothing else in the tree
 * knows analytics exists, which is what keeps every page a server component.
 *
 * Renders null and registers nothing without a measurement ID.
 */
export function SiteAnalytics() {
  const pathname = usePathname();
  // One piece of state rather than a `mounted` flag beside a `choice`: outer
  // null means "storage not read yet", inner null means "read, nobody decided".
  // Together they let the mount effect settle in a single render.
  const [consent, setConsent] = useState<{
    choice: ConsentChoice | null;
  } | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const choice = consent?.choice ?? null;
  const granted = choice?.analyticsGranted === true;

  // Restore this browser's stored decision, without logging a consent event:
  // replaying a stored choice is not a fresh one (same distinction the app
  // draws in `cookie_consent_service.dart`).
  //
  // The setState-in-effect is unavoidable. `localStorage` cannot be read during
  // render (a static export renders on a machine that has none), and a value
  // guessed on the server would mismatch on hydration and flash the banner at
  // someone who answered months ago.
  useEffect(() => {
    if (!isAnalyticsConfigured()) return;
    const stored = readConsent();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent({ choice: stored });
    if (stored !== null) setAnalyticsConsent(stored.analyticsGranted);
  }, []);

  // Page views including the first: `config` sets `send_page_view: false` so
  // this effect is the only source.
  useEffect(() => {
    if (granted) trackPageView();
  }, [pathname, granted]);

  // Capture phase, so a handler calling `stopPropagation()` cannot swallow the
  // event on its way up.
  useEffect(() => {
    if (!granted) return;

    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const description = describeClickTarget(
        event.target,
        window.location.hostname,
      );
      if (description === null) return;
      trackEvent(description.name, description.params);
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [granted]);

  // How the footer button reaches this component — see `CookiePreferencesButton`.
  useEffect(() => {
    const open = () => setPreferencesOpen(true);
    window.addEventListener(OPEN_PREFERENCES_EVENT, open);
    return () => {
      window.removeEventListener(OPEN_PREFERENCES_EVENT, open);
    };
  }, []);

  /** Persist BEFORE applying: a crash mid-apply must not lose the decision. */
  const decide = useCallback((analyticsGranted: boolean) => {
    const next: ConsentChoice = {
      analyticsGranted,
      version: COOKIE_CONSENT_VERSION,
      decidedAt: Date.now(),
    };
    writeConsent(next);
    setConsent({ choice: next });
    setAnalyticsConsent(analyticsGranted);
    // Only on a grant: reporting a refusal to the tool being refused is both
    // contradictory and, at that moment, switched off anyway.
    if (analyticsGranted) {
      trackEvent("cookie_consent_updated", { analytics_granted: 1 });
    }
  }, []);

  if (!isAnalyticsConfigured()) return null;

  // Nothing renders until storage has been read — see the mount effect.
  if (consent === null) return null;

  return (
    <>
      {needsConsent(choice) ? (
        <CookieBanner
          onCustomize={() => setPreferencesOpen(true)}
          onEssentialOnly={() => decide(false)}
          onAcceptAll={() => decide(true)}
        />
      ) : null}
      {/* Conditional on purpose — see the note in `CookiePreferences`. */}
      {preferencesOpen ? (
        <CookiePreferences
          initialAnalyticsGranted={granted}
          onCancel={() => setPreferencesOpen(false)}
          onSave={(analyticsGranted) => {
            setPreferencesOpen(false);
            decide(analyticsGranted);
          }}
        />
      ) : null}
    </>
  );
}
