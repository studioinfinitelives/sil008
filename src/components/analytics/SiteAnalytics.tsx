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
 * It owns the whole feature: the stored consent choice, the banner, the
 * preferences dialog, per-route page views and the delegated click listener.
 * Nothing else in the tree has to know analytics exists — which is what keeps
 * every page and both product sections as server components.
 *
 * With no measurement ID configured this renders `null` and registers nothing,
 * so the site is byte-for-byte the site it was before this feature landed.
 */
export function SiteAnalytics() {
  const pathname = usePathname();
  // One piece of state rather than a `mounted` flag beside a `choice`: the outer
  // `null` means "storage not read yet", the inner one means "read, and nobody
  // has decided". Keeping them together is also what lets the mount effect below
  // settle everything in a single render.
  const [consent, setConsent] = useState<{
    choice: ConsentChoice | null;
  } | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const choice = consent?.choice ?? null;
  const granted = choice?.analyticsGranted === true;

  // Restore whatever this browser decided last time. Applied without logging a
  // consent event: replaying a stored decision is not a fresh one (the app draws
  // the same distinction — `cookie_consent_service.dart`, `logConsentGranted`).
  //
  // The one setState-in-an-effect here is the shape that rule exempts:
  // `localStorage` cannot be read during render, because a static export renders
  // on a machine that has none, and a value guessed on the server would mismatch
  // on hydration and flash the banner at someone who answered months ago.
  useEffect(() => {
    if (!isAnalyticsConfigured()) return;
    const stored = readConsent();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent({ choice: stored });
    if (stored !== null) setAnalyticsConsent(stored.analyticsGranted);
  }, []);

  // Page views, including the first: `gtag('config')` is configured with
  // `send_page_view: false` precisely so this effect is the only source.
  useEffect(() => {
    if (granted) trackPageView();
  }, [pathname, granted]);

  // Delegated click capture. Capture phase so a handler that calls
  // `stopPropagation()` cannot swallow the event on its way up.
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

  // How the footer button reaches this component without prop-drilling a
  // callback through two server components.
  useEffect(() => {
    const open = () => setPreferencesOpen(true);
    window.addEventListener(OPEN_PREFERENCES_EVENT, open);
    return () => {
      window.removeEventListener(OPEN_PREFERENCES_EVENT, open);
    };
  }, []);

  /**
   * Persist first, then apply: a crash mid-apply must still leave the decision
   * remembered, or the banner re-prompts someone who already answered.
   */
  const decide = useCallback((analyticsGranted: boolean) => {
    const next: ConsentChoice = {
      analyticsGranted,
      version: COOKIE_CONSENT_VERSION,
      decidedAt: Date.now(),
    };
    writeConsent(next);
    setConsent({ choice: next });
    setAnalyticsConsent(analyticsGranted);
    // Only on a grant. Reporting a refusal to the tool being refused would be
    // both contradictory and, at that moment, switched off anyway.
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
      {/*
        Mounted only while open, so the dialog seeds its toggle from the current
        choice each time and no closed <dialog> sits in the markup.
      */}
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
