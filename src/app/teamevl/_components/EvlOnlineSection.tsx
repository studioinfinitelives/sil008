import Link from "next/link";
import {
  CTA_BUTTON,
  ONLINE_BUTTON,
} from "@/app/teamevl/_components/EvlCallToAction";
import { EvlPhones } from "@/app/teamevl/_components/EvlPhones";
import { FeatureRow } from "@/components/FeatureRow";
import { Button } from "@/components/ui/button";
import { evlArt } from "@/lib/cdn";

/**
 * The online game's one mention on /teamevl: a band in the game's own black
 * and gold that hands over to /teamevl/online.
 */
export function EvlOnlineSection() {
  return (
    <section
      id="online"
      data-section="evlonline"
      data-analytics-area="online"
      className="bg-canvas px-5 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-center">
          <span className="bg-brand text-on-brand rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
            New · Team EvL Online
          </span>
        </p>
        <FeatureRow
          title="Now summoning online"
          media={
            <EvlPhones
              screens={[
                {
                  ...evlArt.onlineLobby,
                  alt: "A private table in Team EvL Online: a table code, an invite link, five seats and the house rules",
                  fallback: "Picture a private table with a code to share",
                },
                {
                  ...evlArt.onlineTable,
                  alt: "A Team EvL Online table mid-round: four opponents across the top, the Ritual Card in the middle and your hand fanned along the bottom",
                  fallback: "Picture the Ritual Card with your hand below it",
                },
              ]}
            />
          }
        >
          <p>
            The whole game, live in your browser. Open a private table, send the
            code, and bluff with 2–5 players wherever they are.
          </p>
          <div className="mt-8 flex justify-center md:justify-start">
            <Button
              asChild
              size="lg"
              className={`${CTA_BUTTON} ${ONLINE_BUTTON}`}
            >
              <Link href="/teamevl/online" data-analytics-id="see-online">
                See Team EvL Online
              </Link>
            </Button>
          </div>
        </FeatureRow>
      </div>
    </section>
  );
}
