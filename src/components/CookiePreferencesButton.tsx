"use client";

import { OPEN_PREFERENCES_EVENT } from "@/components/analytics/SiteAnalytics";
import { isAnalyticsConfigured } from "@/lib/analytics";

/**
 * Re-opens the cookie preferences dialog from the footer.
 *
 * A window event rather than a callback: the dialog's state lives in
 * `SiteAnalytics`, a SIBLING of `SiteFooter` in the root layout, not an
 * ancestor. Prop-drilling would force two server components to become client
 * components.
 *
 * Renders nothing without a measurement ID.
 */
export function CookiePreferencesButton() {
  if (!isAnalyticsConfigured()) return null;

  return (
    <button
      type="button"
      data-analytics="off"
      className="text-subtle hover:text-ink cursor-pointer"
      onClick={() =>
        window.dispatchEvent(new CustomEvent(OPEN_PREFERENCES_EVENT))
      }
    >
      Cookie Preferences
    </button>
  );
}
