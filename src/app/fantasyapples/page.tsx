import type { Metadata } from "next";
import Image from "next/image";
import { FaScreenshot } from "@/app/fantasyapples/_components/FaScreenshot";
import { FeatureRow } from "@/components/FeatureRow";
import { Button } from "@/components/ui/button";
import { faArt } from "@/lib/cdn";
import { FA_APP_URL, FA_LEGAL_LINKS } from "@/lib/faLinks";

const DESCRIPTION =
  "A free fantasy hockey companion for Yahoo Fantasy leagues. Every player rated by your league's scoring, every manager ranked.";

export const metadata: Metadata = {
  title: "Fantasy Apples",
  description: DESCRIPTION,
  alternates: { canonical: "/fantasyapples" },
  // Overrides the studio defaults inherited from the root layout; the OG image
  // itself is picked up automatically from this segment's `opengraph-image`.
  openGraph: {
    title: "Fantasy Apples",
    description: DESCRIPTION,
    url: "/fantasyapples",
  },
};

/** The Fantasy Apples product page, laid out as /habisloth. */
export default function Page() {
  return (
    <main className="bg-canvas flex-1">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 py-20 text-center sm:py-28">
        <span className="bg-brand text-on-brand rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
          Fantasy Apples
        </span>
        <h1 className="text-ink text-4xl font-black tracking-tight text-balance sm:text-6xl">
          Fantasy hockey, by the numbers.
        </h1>
        <p className="text-subtle max-w-[42ch] text-lg sm:text-xl">
          A companion for your Yahoo Fantasy league. Every player rated by your
          league&rsquo;s own scoring, every manager ranked.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-2 h-13 rounded-full px-8 text-base font-bold tracking-wide uppercase"
        >
          {/*
            Both calls to action share a label, so the derived label cannot
            tell them apart. `data-analytics-id` names which is which.
          */}
          <a href={FA_APP_URL} data-analytics-id="open-fantasyapples-hero">
            Open Fantasy Apples
          </a>
        </Button>
        <p className="text-subtle text-sm">Free while in public beta.</p>
        <Image
          src={faArt.logo.src}
          alt=""
          width={faArt.logo.width}
          height={faArt.logo.height}
          className="mt-6 h-auto w-full max-w-sm"
          priority
        />
      </section>

      <div className="mx-auto max-w-6xl px-5">
        <FeatureRow
          title="Every player, rated."
          wideMedia
          media={
            <FaScreenshot
              {...faArt.playersGrid}
              alt="The Players grid: skaters ranked by a composite score, each stat cell shaded green above average and darker below"
            />
          }
        >
          <p>
            Every NHL skater and goalie, ranked against the stats your league
            actually scores. Cells shade green above average, so a hot streak
            jumps out of the grid.
          </p>
          <p className="mt-4">
            Filter by position, NHL team or fantasy manager, and keep a
            watchlist of the names you are eyeing.
          </p>
        </FeatureRow>

        <FeatureRow
          title="The whole story on one card."
          mediaLeft
          media={
            <FaScreenshot
              {...faArt.playerCard}
              alt="A player card for Leon Draisaitl: next game, manager, season totals, recent games and the Oilers' October schedule"
            />
          }
        >
          <p>
            Tap a player for their next game, latest news, season totals, game
            log and their team&rsquo;s schedule for the month. Home and away at
            a glance.
          </p>
        </FeatureRow>

        <FeatureRow
          title="See a player's shape."
          media={
            <FaScreenshot
              {...faArt.playerStar}
              alt="A star chart comparing one player across three date ranges, with stat ranks, score badges and his current line and power-play unit"
            />
          }
        >
          <p>
            A star chart puts every stat side by side against the league. Lay up
            to three date ranges over each other to tell a trend from a hot
            week.
          </p>
          <p className="mt-4">
            Current lines and power-play units sit right underneath.
          </p>
        </FeatureRow>

        <FeatureRow
          title="How your league stacks up."
          mediaLeft
          media={
            <FaScreenshot
              {...faArt.managersGrid}
              alt="The Managers grid on a phone: each fantasy team's roster totals per stat, ranked and shaded against the league average"
            />
          }
        >
          <p>
            Every manager&rsquo;s roster added up stat by stat and ranked
            against the league. Find out where you are thin before the trade
            deadline does.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Weight what matters."
          media={
            <FaScreenshot
              {...faArt.gridSettings}
              alt="The grid settings: position source, minimum games played, shading strength and a weight slider for every stat"
            />
          }
        >
          <p>
            Switch a stat off or count it double, and every rating and rank
            follows. Set the minimum games played and how strongly the grid
            shades.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Your team beside your watchlist."
          mediaLeft
          media={
            <FaScreenshot
              {...faArt.rosterWatchlist}
              alt="My team and the watchlist side by side, grouped by position, with injured players flagged"
            />
          }
        >
          <p>
            Your roster and your watchlist, side by side by position, injuries
            flagged. Tick two or three players to compare them head to head.
          </p>
        </FeatureRow>
      </div>

      <section className="bg-surface-alt mt-10 px-5 py-20 text-center sm:py-24">
        <h2 className="text-ink text-3xl font-black tracking-tight text-balance sm:text-4xl">
          Know your league better than your league does.
        </h2>
        <Button
          asChild
          size="lg"
          className="mt-8 h-13 rounded-full px-8 text-base font-bold tracking-wide uppercase"
        >
          <a href={FA_APP_URL} data-analytics-id="open-fantasyapples-closing">
            Open Fantasy Apples
          </a>
        </Button>
      </section>

      <div className="mx-auto max-w-6xl px-5 pb-6">
        <nav
          className="border-line mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-sm"
          aria-label="Fantasy Apples legal"
        >
          {FA_LEGAL_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-link underline underline-offset-4"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </main>
  );
}
