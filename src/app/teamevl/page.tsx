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
 * The Team EvL product page. Same shape as Habi Sloth: pitch, photo turntable,
 * alternating feature rows, closing call to action, link nav.
 *
 * Every row goes through `EvlArt` for the stand-in path. The hero is the one
 * exception; see the note on it.
 *
 * Sizes come with the URLs from `lib/cdn.ts` rather than being written here,
 * because they must match the uploaded file — see that file.
 */

/** Shared by both calls to action, so the pair cannot drift apart. */
const CTA_BUTTON =
  "h-13 rounded-full px-8 text-base font-bold tracking-wide uppercase";

/**
 * Buy button with the rulebook beside it.
 *
 * Resolves whichever edition is current, so a new printing changes
 * `lib/rulebooks.ts` and nothing else. The PDF is off-site, hence a plain
 * anchor in a new tab rather than a `Link`.
 *
 * `area` is REQUIRED, not optional: both calls to action render the same two
 * button labels, so without it the reports cannot tell top from bottom.
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
 * Decorative closing flourish. `alt=""` keeps it out of the accessibility tree.
 *
 * BOTH files render and the `dark:` variant hides one, as `ThemeToggle` does
 * with its icons. A single `<Image>` switching `src` on theme cannot work: a
 * static export is written before the theme is known, and choosing in the
 * browser flashes the wrong ink on first paint.
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
      {/* Fixed to the viewport, so it rides the whole scroll. */}
      <EvlLinkDrawer />

      {/*
        The width cap sits on the children, not the section, so the hero art can
        run wider than the copy while both stay centred on the same axis.
      */}
      <section className="flex flex-col items-center gap-6 px-5 py-20 text-center sm:py-28">
        {/*
          No `text-balance` on the h1 below: the manual break after "game" is
          intended, and balancing would pull words off the first line even when
          it fits.
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
          The hero banner, the page's LCP element. A plain `next/image` rather
          than `EvlArt`, the only one on the page: it wants `priority`, which
          the stand-in path has no use for.

          The negative margins cancel transparent padding baked into the file,
          which is 27.8% of its own height top and bottom. They are PERCENTAGES,
          not fixed pixels, because that padding scales with the image: pixel
          margins tuned on desktop eat into the artwork on a phone. A percentage
          margin resolves against the containing block's width, which is why the
          wrapper exists, capped to the same `max-w-6xl` as the image.
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
        {/* The alternation starts here: every row below flips `mediaLeft`. */}
        <FeatureRow title="Human played" media={<EvlPhotoCarousel />}>
          <p>
            Team EvL is enjoyed worldwide as a language-independent game; it
            even took a ship to Antarctica. Does that make the game better?
            <br />
            <br />
            Absolutely. Call my bluff.
          </p>
        </FeatureRow>
        <FeatureRow
          title="Human made"
          media={
            <EvlArt
              {...evlArt.cards}
              alt="The Element cards — Dark, Light, Earth, Fire and Water — fanned out beside the Team EvL box"
              fallback="Picture the five Element cards fanned out beside the box"
            />
          }
          mediaLeft
        >
          <p>
            Handcrafted without AI entirely by one solo entrepreneur with a
            10-year dream. Art, story, game mechanics, design, and good
            old-fashioned elbow grease. Your support is immensely appreciated.
          </p>
        </FeatureRow>

        <FeatureRow
          title="No other game like it"
          media={
            <EvlArt
              {...evlArt.ritualCards}
              alt="Three Ritual Cards fanned out — Leviux, Harpies and Lucifer — each showing the Elements arranged around its circle"
              fallback="Picture three Ritual Cards fanned out, each with its own arrangement of Elements"
            />
          }
        >
          <p>
            Bluffing and risky strategies like you&rsquo;ve never played before.
            You could win by luck, but the best win with the certainty of skill.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Made in Wisconsin – Designed in Illinois"
          mediaLeft
          media={
            <EvlArt
              {...evlArt.tokens}
              alt="The Element tokens — the six pieces a turn moves within the ritual circle"
              fallback="Picture the six Element tokens a turn moves around the circle"
            />
          }
        >
          <p>
            Team EvL is like an indie band. You are actually cooler than the
            corporate gold diggers if you own a copy.
            <br />
            <br />
            Monopoly sucks 🤘
          </p>
        </FeatureRow>

        <FeatureRow
          title="Different every time"
          media={
            <EvlArt
              {...evlArt.elements}
              alt="The Element orbs — Fire, Water, Air, Earth, Light, Dark and the wheel that holds them"
              fallback="Picture the Element orbs and the wheel that holds them"
            />
          }
        >
          <p>
            You bluff, they bluff bluffing. Rinse and repeat. The game is played
            in rounds. Players adapt and adjust on the fly. Slow is not always
            certain. When you are predictable, they skip to the finish line.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Travel and player friendly"
          mediaLeft
          media={
            <EvlArt
              {...evlArt.travelBag}
              alt="Five shrink-wrapped Team EvL decks spilling out of their cream drawstring bag"
              fallback="Picture the decks spilling out of their drawstring travel bag"
            />
          }
        >
          <p>
            Team EvL travels light and plays with a wide range of groups.
            <br />
            <br />
            2–5 players · 60 min. Different every time.
          </p>
        </FeatureRow>
      </div>

      <section className="bg-surface-alt mt-10 px-5 py-20 text-center sm:py-24">
        {/*
          `EvlArt` centres itself; the wrapper only caps its width in a section
          that is otherwise full-bleed. `max-w-3xl` is 768px, the largest round
          cap still under the GIF's own 870px, so it never upscales.
        */}
        <div className="mx-auto mb-10 w-full max-w-3xl">
          <EvlArt
            {...evlArt.players}
            alt="Team EvL promo animation, opening on a title card reading “2-5 players”"
            fallback="Picture the whole table leaning over one ritual circle"
            // Opaque and hard-edged, unlike the transparent row art, so it
            // takes the corner radius the stand-in box has.
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
