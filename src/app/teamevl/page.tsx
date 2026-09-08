import type { Metadata } from "next";
import Image from "next/image";
import { EvlArt } from "@/app/teamevl/_components/EvlArt";
import { EvlLinkDrawer } from "@/app/teamevl/_components/EvlLinkDrawer";
import { EvlPhotoCarousel } from "@/app/teamevl/_components/EvlPhotoCarousel";
import { FeatureRow } from "@/components/FeatureRow";
import { Button } from "@/components/ui/button";
import {
  EVL_BLOOMS_HEIGHT,
  EVL_BLOOMS_WIDTH,
  evlArt,
  evlBlooms,
} from "@/lib/cdn";
import { currentRulebook } from "@/lib/rulebooks";

const DESCRIPTION =
  "The UNcooperative card game of bluffing, social deduction, and general evil.";

const BUY_URL = "https://www.thegamecrafter.com/games/team-evl";

export const metadata: Metadata = {
  title: "Team EvL",
  description: DESCRIPTION,
  alternates: { canonical: "/teamevl" },
  // Overrides the studio defaults inherited from the root layout; the OG image
  // itself is picked up automatically from this segment's `opengraph-image`.
  openGraph: {
    title: "Team EvL",
    description: DESCRIPTION,
    url: "/teamevl",
  },
};

/**
 * The Team EvL product page.
 *
 * Built to the same shape as Habi Sloth: a short pitch, a row of photographs
 * from real games on a turntable, alternating feature rows explaining the game
 * a beat at a time, a closing call to action, and then every destination the
 * Linktree currently carries. The photographs lead because they are the only
 * proof on the page that anyone plays this — the drawn rows can explain a rule
 * to somebody already interested, which is what the photographs are there to
 * make them.
 *
 * All of the art is on the CDN now — nothing is staged in `public/` any more —
 * so every row goes through `EvlArt` and gets a written stand-in if the file
 * cannot be fetched. The hero is the one exception: see the note on it.
 *
 * Sizes come with the URLs from `lib/cdn.ts` rather than being written out
 * here, because `next/image` is unoptimized site-wide and those numbers exist
 * only to reserve the box — they have to be what was actually uploaded, and the
 * one place that can be true is beside the filename.
 */

/** Shared by both calls to action, so the pair cannot drift apart. */
const CTA_BUTTON =
  "h-13 rounded-full px-8 text-base font-bold tracking-wide uppercase";

/**
 * The buy button, with the rulebook beside it.
 *
 * Someone deciding whether to buy a bluffing game wants to know how it plays
 * first, so the rules sit at the point of sale rather than only down in the
 * link list. Outline against the filled buy button: it is the second thing to
 * click, not a competing one.
 *
 * The PDF is off-site (the studio's own CDN, not this export), which is why it
 * is a plain anchor opening in a new tab — leaving the page mid-decision is
 * exactly what this is meant to avoid.
 *
 * It is whichever edition is current rather than a fixed file, so a new
 * printing changes `lib/rulebooks.ts` and nothing else. Older editions are one
 * click further out, on /teamevl/rules.
 *
 * `area` is required rather than optional: both calls to action render the same
 * two button labels, so without it the analytics reports could not tell a click
 * at the top of the page from one at the bottom — which is the only interesting
 * thing about having two.
 */
function CallToAction({
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
        <a href={BUY_URL}>Buy Team EvL</a>
      </Button>
      <Button asChild size="lg" variant="outline" className={CTA_BUTTON}>
        <a href={currentRulebook.url} target="_blank" rel="noreferrer">
          Download Rules
        </a>
      </Button>
    </div>
  );
}

/**
 * The blooms strip that signs off the page, under the last buy button.
 *
 * Purely decorative — `alt=""` keeps it out of the accessibility tree, because
 * it says nothing the heading above it has not already said.
 *
 * Both files are rendered and one is hidden by the `dark:` variant, the way
 * `ThemeToggle` swaps its icons. A single `<Image>` whose `src` depends on the
 * theme cannot work here: this is a static export, so the HTML is written
 * before anyone's theme is known, and picking in the browser would flash the
 * wrong ink on first paint.
 */
function BloomsFlourish() {
  const size = { width: EVL_BLOOMS_WIDTH, height: EVL_BLOOMS_HEIGHT };
  const shared = "mx-auto mt-10 -mb-20 h-auto w-full max-w-6xl";
  return (
    <>
      <Image
        src={evlBlooms.onLight}
        alt=""
        {...size}
        className={`${shared} dark:hidden`}
      />
      <Image
        src={evlBlooms.onDark}
        alt=""
        {...size}
        className={`${shared} hidden dark:block`}
      />
    </>
  );
}

export default function Page() {
  return (
    <main className="bg-canvas flex-1">
      {/*
        Pinned to the viewport rather than to a section, so it rides along the
        whole scroll. One of the two client components on the page, the other
        being the photo carousel that opens the rows.
      */}
      <EvlLinkDrawer />

      {/*
        The width cap moved off the section and onto the children, so the hero
        art can run wider than the copy above it: prose stays at a reading
        measure, the banner takes the same `max-w-6xl` gutter as the feature
        rows below, and both stay centred on the same axis.
      */}
      <section className="flex flex-col items-center gap-6 px-5 py-20 text-center sm:py-28">
        {/*
          No `text-balance` here, deliberately. The break after "game" is the
          one we want, and balancing would even out the two halves by pulling
          words off the first line even when it fits — which is the opposite of
          the intent. Left to wrap normally, the first line breaks only on a
          viewport too narrow to hold it.
        */}
        <span className="bg-brand text-on-brand rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
          Team EvL
        </span>
        <h1 className="text-ink max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
          The only UNcooperative game
          <br />
          to bring EvL back.
        </h1>
        <p className="text-subtle mt-6 max-w-[42ch] text-lg sm:text-xl">
          Summon the Demon. Save the World.
        </p>
        {/*
          The hero banner. `h-auto` against the declared 1600×600 is what keeps
          it proportionate as it scales — the cap is on width alone, so the
          height follows.

          The negative margins more than cancel the section's `gap-6`, because
          the file carries 27.8% of its own height as transparent padding at the
          top and bottom — left alone, that padding reads as a hole above the
          banner and another below it.

          They are percentages rather than a fixed `-mt-22`/`-mb-16` because
          that padding scales with the image: it is ~120px of the 432px-tall
          desktop render but only ~36px at 350px wide, so pixel margins that
          look right on a desktop eat into the artwork on a phone, and the
          tagline and buttons end up sitting on top of it. A percentage margin
          resolves against the containing block's width, which is why the
          wrapper below exists — it is capped to the same `max-w-6xl` as the
          image, so the percentages track the render at every width.

          A plain `next/image` rather than `EvlArt`, the only piece on the page
          that is: this is the LCP element and wants `priority`, which the
          stand-in path has no use for, and a dashed box reading "picture the
          banner" under an `h1` that already says Team EvL would be worse than
          the gap it fills.
        */}
        <div className="w-full max-w-6xl">
          <Image
            {...evlArt.hero}
            alt="Team EvL"
            className="-mt-[7%] -mb-[5%] h-auto w-full"
            priority
          />
        </div>
        <CallToAction area="hero" />
      </section>

      <div className="mx-auto max-w-6xl px-5">
        {/*
          The photographs open the rows: everything below is product art
          explaining a rule, and this is the one row showing the game being
          played rather than described — the reader meets the people first and
          then finds out what they are doing.

          Copy left, photographs right — and the alternation runs from here
          down, so every drawn row below takes the opposite side to the one
          before it.
        */}
        <FeatureRow
          title="Human made. Human played."
          media={<EvlPhotoCarousel />}
        >
          <p>
            Made in Wisconsin, Designed in Illinois. Played on every continent.
            Team EvL travels light and brings people together.
          </p>
        </FeatureRow>

        <FeatureRow
          title="No other game like it"
          mediaLeft
          media={
            /*
              A transparent cutout like the rest of the drawn art, so it sits
              straight on the page with no panel or corner radius behind it, and
              it takes the same `max-w-md` — it is simply shorter than a 4:3
              row, being a wide fan rather than a scene.
            */
            <EvlArt
              {...evlArt.cards}
              alt="The Element cards — Dark, Light, Earth, Fire and Water — fanned out beside the Team EvL box"
              fallback="Picture the five Element cards fanned out beside the box"
            />
          }
        >
          <p>
            No other game has mechanics quite like this one, or your money back.
          </p>
        </FeatureRow>

        <FeatureRow
          title="One action. That’s your turn."
          media={
            <EvlArt
              {...evlArt.tokens}
              alt="The Element tokens — the six pieces a turn moves within the ritual circle"
              fallback="Picture the six Element tokens a turn moves around the circle"
            />
          }
        >
          <p>
            Move an Element in the ritual circle and nothing else. What you are
            really buying is information, and more of it than anyone else has.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Made in Wisconsin. Designed in Illinois"
          mediaLeft
          media={
            /*
              The Ritual Cards themselves, fanned so three of them show at once
              — the row's copy is about reading the circle against the card, and
              a fan says there is more than one to be dealt faster than a single
              card would.
            */
            <EvlArt
              {...evlArt.ritualCards}
              alt="Three Ritual Cards fanned out — Leviux, Harpies and Lucifer — each showing the Elements arranged around its circle"
              fallback="Picture three Ritual Cards fanned out, each with its own arrangement of Elements"
            />
          }
        >
          <p>
            The Ritual Card names what the summoning needs. Read the circle
            against it and work out what is still out of place.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Different every time."
          media={
            /*
              The demons themselves, which is the row's argument: a different
              one is summoned each game, so the sheet says "different every
              time" faster than a single scene could.

              Transparent and sitting straight on the page like the other drawn
              rows — no plate, no corner radius. The creatures are white fills
              with black linework, so they read as intended against the dark
              theme; on the light theme the white bodies drop away and the black
              linework carries the shapes.
            */
            <EvlArt
              {...evlArt.demons}
              alt="Six demons that can be summoned in Team EvL — a beetle, a peacock, a cobra, a haloed fox, a bat and a phoenix"
              fallback="Picture the six demons a game can summon, no two alike"
            />
          }
        >
          <p>
            Think the Elements are in order? Say so. Get it right and the demon
            arrives; get it wrong in front of everyone and you have just told
            the table what you know.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Table talk is EvL."
          mediaLeft
          media={
            <EvlArt
              {...evlArt.elements}
              alt="The Element orbs — Fire, Water, Air, Earth, Light, Dark and the wheel that holds them"
              fallback="Picture the Element orbs and the wheel that holds them"
            />
          }
        >
          <p>
            Talking is not a leak, it is the game. Lie, bargain, and read the
            pauses.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Small Package. Complex Strategies."
          media={
            <EvlArt
              {...evlArt.demonCoins}
              alt="The six demon tokens on their coloured discs"
              fallback="Picture the six demon tokens on their coloured discs"
            />
          }
        >
          <p>
            Nudge your &ldquo;Team&rdquo; into summoning too soon. Their mistake
            is your information.
          </p>
        </FeatureRow>
      </div>

      <section className="bg-surface-alt mt-10 px-5 py-20 text-center sm:py-24">
        {/*
          The promo GIF signs the page off rather than opening it: it is the
          one piece of art that moves, so it sits directly above the last buy
          button where it is the final thing seen before the decision.

          `EvlArt` centres itself, and the wrapper only caps how wide it runs
          in a section that is otherwise full-bleed. It runs wider than the row
          art — `max-w-3xl` is 768px, which is the largest round cap that still
          sits under the GIF's own 870px, so it never upscales into softness.
        */}
        <div className="mx-auto mb-10 w-full max-w-3xl">
          <EvlArt
            {...evlArt.players}
            alt="Team EvL promo animation, opening on a title card reading “2-5 players”"
            fallback="Picture the whole table leaning over one ritual circle"
            // Opaque and hard-edged, unlike the transparent art the rows are
            // waiting on, so it gets the corner the fallback box has.
            className="max-w-3xl rounded-2xl"
          />
        </div>
        <CallToAction area="closing" className="mb-10" />
        <h2 className="text-ink text-3xl font-black tracking-tight text-balance sm:text-4xl">
          Only the most EvL can win.
        </h2>
        <BloomsFlourish />
      </section>
    </main>
  );
}
