import { Button } from "@/components/ui/button";
import { EVL_BUY_URL } from "@/lib/evlLinks";
import { currentRulebook } from "@/lib/rulebooks";

/** Shared by every Team EvL call to action, so the buttons cannot drift apart. */
export const CTA_BUTTON =
  "h-13 rounded-full px-8 text-base font-bold tracking-wide uppercase";

/**
 * Buy button with the rulebook beside it.
 *
 * Resolves whichever edition is current, so a new printing changes
 * `lib/rulebooks.ts` and nothing else. The PDF is off-site, hence a plain
 * anchor in a new tab rather than a `Link`.
 *
 * `area` is REQUIRED, not optional: every call to action renders the same two
 * button labels, so without it the reports cannot tell them apart.
 */
export function EvlCallToAction({
  area,
  className,
}: {
  area: string;
  className?: string;
}) {
  return (
    <div
      data-analytics-area={area}
      className={`flex flex-wrap items-center justify-center gap-3 ${className ?? ""}`}
    >
      <Button asChild size="lg" className={CTA_BUTTON}>
        <a href={EVL_BUY_URL}>Buy Team EvL</a>
      </Button>
      <Button asChild size="lg" variant="outline" className={CTA_BUTTON}>
        <a href={currentRulebook.url} target="_blank" rel="noreferrer">
          Download Rules
        </a>
      </Button>
    </div>
  );
}
