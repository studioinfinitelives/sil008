import type { Metadata } from "next";
import Image from "next/image";
import { FaDemoVideo } from "@/app/fantasyapples/_components/FaDemoVideo";
import { FaScreenshot } from "@/app/fantasyapples/_components/FaScreenshot";
import { FeatureRow } from "@/components/FeatureRow";
import { Button } from "@/components/ui/button";
import { faArt } from "@/lib/cdn";
import { FA_APP_URL, FA_LEGAL_LINKS } from "@/lib/faLinks";

const DESCRIPTION =
  "A free fantasy hockey companion for fantasy leagues. Every player rated by your league's scoring, every manager ranked.";

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
          A companion for your fantasy league. Every player rated by your
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
          title="The filters you've been looking for."
          wideMedia
          media={
            <FaDemoVideo
              {...faArt.filtersDemo}
              label="filtering the Players grid in Fantasy Apples"
            />
          }
        >
          <p>
            Search free agency by forward line, defense pairing or power-play
            unit. Find the starting goalies, or the tandem goalie that
            didn&rsquo;t play their team&rsquo;s previous game.
          </p>
          <p className="mt-4">
            Rank by per-game averages with a minimum games played, so a hot
            three-game call-up doesn&rsquo;t top the list. Pick the days you
            need covered this week and see only the players whose teams play
            them.
          </p>
          <p className="mt-4">
            Show who is in the top three of any stat, and bookmark a set of
            filters to bring back with one tap.
          </p>
        </FeatureRow>

        <FeatureRow
          title="The whole story on one card."
          mediaLeft
          media={
            <FaScreenshot
              {...faArt.playerCard}
              alt="A player card for Kyle Connor: upcoming games, a game log with this fantasy week highlighted, Winnipeg's record and its October schedule with results"
            />
          }
        >
          <p>
            Tap a player for their upcoming games, latest news and game log,
            with this fantasy week highlighted. Their team&rsquo;s record and
            month schedule, results included, sit underneath.
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
          title="Go head to head with any manager."
          mediaLeft
          media={
            <FaScreenshot
              {...faArt.managersCompare}
              alt="Compare managers: two fantasy teams overlaid on one star chart, stat by stat, with their score, SD and composite ranks"
            />
          }
        >
          <p>
            Lay two rosters over each other on one star chart, stat by stat, for
            this week, the season or the last 15 to 90 days. Their ranks against
            the league sit underneath.
          </p>
          <p className="mt-4">
            Then see what each side is expected to put up in any fantasy week.
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
