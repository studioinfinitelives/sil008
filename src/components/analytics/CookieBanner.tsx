"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CookieBannerProps {
  onCustomize: () => void;
  onEssentialOnly: () => void;
  onAcceptAll: () => void;
}

/**
 * Bottom-anchored consent banner, shown until the visitor makes a choice.
 *
 * "Essential only" and "Accept all" carry equal visual weight — refusing has to
 * be exactly as easy as accepting, so neither is styled as the obvious answer.
 * "Customize" opens the per-category layer. The copy is transcribed from the
 * Habi Sloth app's shipped banner (`sil_common/lib/elements/cookie_consent_banner.dart`)
 * so the two properties read alike; it is not to be reworded here.
 *
 * A `region`, not a `dialog`: it does not trap focus, because it does not block
 * the page. Semantic tokens only, since it floats over every section and has to
 * re-colour with whichever brand is underneath it.
 *
 * `data-analytics="off"` keeps the banner's own buttons out of the reports —
 * clicking "Essential only" must never itself be an analytics event.
 */
export function CookieBanner({
  onCustomize,
  onEssentialOnly,
  onAcceptAll,
}: CookieBannerProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50"
      role="region"
      aria-label="Cookie consent"
      data-analytics="off"
    >
      <div className="border-line bg-surface m-3 mx-auto max-w-3xl rounded-2xl border p-4 shadow-xl">
        <p className="text-ink text-sm">
          We use essential storage to run this site and, with your permission,
          optional analytics cookies to understand aggregate usage.{" "}
          <Link href="/privacy" className="text-link underline">
            Learn more
          </Link>
        </p>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onCustomize}>
            Customize
          </Button>
          <Button variant="outline" onClick={onEssentialOnly}>
            Essential only
          </Button>
          <Button onClick={onAcceptAll}>Accept all</Button>
        </div>
      </div>
    </div>
  );
}
