import type { Metadata } from "next";
import Image from "next/image";
import {
  AppScreenshot,
  FeatureArt,
  FeatureRow,
} from "@/app/habisloth/_components/FeatureRow";
import { HabiSlothLinks } from "@/app/habisloth/_components/HabiSlothLinks";
import { Button } from "@/components/ui/button";
import { habiArt, habiScreens } from "@/lib/cdn";

const DESCRIPTION =
  "A habit tracking app for the easy going. Set a weekly goal and Habi Sloth works out the daily pace.";

const APP_URL = "https://habisloth.app";

export const metadata: Metadata = {
  title: "Habi Sloth",
  description: DESCRIPTION,
  alternates: { canonical: "/habisloth" },
  // Overrides the studio defaults inherited from the root layout; the OG image
  // itself is picked up automatically from this segment's `opengraph-image`.
  openGraph: {
    title: "Habi Sloth",
    description: DESCRIPTION,
    url: "/habisloth",
  },
};

/**
 * The Habi Sloth product page.
 *
 * Laid out as alternating feature rows with a lot of air between them: a short
 * written bite on one side, and on the other either the app's own art or a shot
 * of the running app. The wheel row is the page's argument, so it comes first.
 *
 * The wheel is shown as a screenshot rather than rebuilt in the browser. A
 * recreation has to be kept in step with the app by hand and is wrong the
 * moment the app moves; a capture is simply what the app looks like.
 */
export default function Page() {
  return (
    <main className="bg-canvas flex-1">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 py-20 text-center sm:py-28">
        <span className="bg-brand text-on-brand rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
          Habi Sloth
        </span>
        <h1 className="text-ink text-4xl font-black tracking-tight text-balance sm:text-6xl">
          A habit tracking app for the easy going.
        </h1>
        <p className="text-subtle max-w-[42ch] text-lg sm:text-xl">
          Set a goal for the week. Habi Sloth works out what that means today.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-2 h-13 rounded-full px-8 text-base font-bold tracking-wide uppercase"
        >
          <a href={APP_URL}>Get Habi Sloth</a>
        </Button>
        <Image
          src={habiArt.idea}
          alt=""
          width={1272}
          height={706}
          className="mt-6 h-auto w-full max-w-lg"
          priority
        />
      </section>

      <div className="mx-auto max-w-6xl px-5">
        <FeatureRow
          title="One wheel. Every habit."
          media={
            <AppScreenshot
              src={habiScreens.home}
              alt="The Habi Sloth home screen: a habit called Tiny Good Deed with its weekly goal and daily pace, and the habit wheel below"
              width={964}
              height={1998}
            />
          }
        >
          <p>
            Your habits sit around the wheel. Tap one to tick it off — the ring
            fills as you go, and the colour deepens each time you lap the
            day&rsquo;s target.
          </p>
          <p className="mt-4">
            Everything for a habit lives on one screen. No menus to go digging
            through.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Goals by the week."
          mediaLeft
          media={
            <FeatureArt
              src={habiArt.week}
              alt="A sloth pointing along the days of the week, each one marked by a different habit"
              width={1196}
              height={892}
            />
          }
        >
          <p>
            Miss a Tuesday and nothing is broken. Habi Sloth spreads the goal
            across the days you picked and quietly tells you the pace to keep.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Keep a habit together."
          media={
            <FeatureArt
              src={habiArt.friends}
              alt="Two sloths keeping a habit together"
              width={1096}
              height={701}
            />
          }
        >
          <p>
            Share a habit with a friend and the count is pooled. Half each, and
            neither of you carries it alone.
          </p>
        </FeatureRow>

        <FeatureRow
          title="The month at a glance."
          mediaLeft
          media={
            <FeatureArt
              src={habiArt.calendar}
              alt="A sloth marking off a calendar"
              width={1095}
              height={852}
            />
          }
        >
          <p>
            Every day scored against its own target, laid out as a heatmap. Good
            weeks are obvious. So are the ones you would rather forget.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Take the week off."
          media={
            <FeatureArt
              src={habiArt.beach}
              alt="A sloth on holiday"
              width={1151}
              height={857}
            />
          }
        >
          <p>
            Vacation mode pauses everything without breaking a streak or
            scolding you for it. Rest is not a lapse.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Works with no signal."
          mediaLeft
          media={
            <FeatureArt
              src={habiArt.weights}
              alt="A sloth lifting weights"
              width={1003}
              height={571}
            />
          }
        >
          <p>
            Offline first, so a tunnel or a flight changes nothing. Reminders
            arrive when you asked for them, and not otherwise.
          </p>
        </FeatureRow>
      </div>

      <section className="bg-surface-alt mt-10 px-5 py-20 text-center sm:py-24">
        <h2 className="text-ink text-3xl font-black tracking-tight text-balance sm:text-4xl">
          Slow is fine. Stopping isn&rsquo;t.
        </h2>
        <Button
          asChild
          size="lg"
          className="mt-8 h-13 rounded-full px-8 text-base font-bold tracking-wide uppercase"
        >
          <a href={APP_URL}>Get Habi Sloth</a>
        </Button>
      </section>

      <div className="mx-auto max-w-6xl px-5 pb-6">
        <HabiSlothLinks omit="/habisloth" />
      </div>
    </main>
  );
}
