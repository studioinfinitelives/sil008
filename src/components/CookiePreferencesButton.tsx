"use client";

import { OPEN_PREFERENCES_EVENT } from "@/components/analytics/SiteAnalytics";
import { isAnalyticsConfigured } from "@/lib/analytics";

/**
 * The footer's way of re-opening the cookie preferences dialog.
 *
 * A window event rather than a callback: the dialog's state lives in
 * `SiteAnalytics`, which sits beside `SiteFooter` in the root layout rather than
 * above it, and shouting is cheaper than prop-drilling a handler through two
 * server components — which would have to become client components to carry it.
 *
 * Renders nothing when the site ships without a measurement ID: a button
 * offering to configure cookies that do not exist is worse than no button.
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
