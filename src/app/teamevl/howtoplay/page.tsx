import type { Metadata } from "next";
import { EvlArt } from "@/app/teamevl/_components/EvlArt";
import { EvlBloomsFlourish } from "@/app/teamevl/_components/EvlBloomsFlourish";
import {
  CTA_BUTTON,
  EvlCallToAction,
} from "@/app/teamevl/_components/EvlCallToAction";
import { EvlInfoDialog } from "@/app/teamevl/_components/EvlInfoDialog";
import { EvlLinkDrawer } from "@/app/teamevl/_components/EvlLinkDrawer";
import { FeatureRow } from "@/components/FeatureRow";
import { Button } from "@/components/ui/button";
import { evlArt } from "@/lib/cdn";
import { EVL_VIDEO_URL } from "@/lib/evlLinks";
import { currentRulebook } from "@/lib/rulebooks";

const DESCRIPTION =
  "Learn Team EvL in a few minutes: win rounds by Calling the Ritual, one action per turn.";

export const metadata: Metadata = {
  title: "How to Play",
  description: DESCRIPTION,
  alternates: { canonical: "/teamevl/howtoplay" },
  openGraph: {
    title: "How to Play Team EvL",
    description: DESCRIPTION,
    url: "/teamevl/howtoplay",
  },
};

/**
 * The rules walkthrough, laid out like /teamevl. Copy follows the Game Crafter
 * store page, not the rulebook PDF.
 */

// Opaque, hard-edged art: full column width with a corner radius.
const GIF_CLASS = "rounded-2xl";

export default function Page() {
  return (
    <main className="bg-canvas flex-1">
      <EvlLinkDrawer />

      <section className="flex flex-col items-center gap-6 px-5 py-20 text-center sm:py-28">
        <span className="bg-brand text-on-brand rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase">
          Team EvL
        </span>

        <h1 className="text-ink max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
          How to Play
        </h1>
        <p className="text-subtle text-sm font-bold tracking-wider uppercase">
          2–5 players · 30–60 min · Ages 14+
        </p>
        <p className="text-subtle text-lg sm:text-xl">
          Summon the demon before anyone else.
          <br />
          Do it 3x to be a winner just like these beautiful EvL liars.
          <EvlInfoDialog label="Where these photos were taken" title="Fun Fact!">
            Team EvL is played all around the world. This small sample of images happen to
            be from
            <br /><br />
            (left to right) <br />
            <b>France, Spain, Illinois, England, France, Bulgaria,
              Bulgaria, California.</b>
          </EvlInfoDialog>
        </p>
        {/* Full-bleed: `-mx-5` cancels the section's `px-5`, and stretch absorbs the margins. */}
        <div className="-mx-5 mt-4 self-stretch">
          <EvlArt
            {...evlArt.playersBanner}
            alt="A strip of eight photos of Team EvL players around the world, each grinning and holding up their cards"
            fallback="Picture players around the world holding up their cards"
            className=""
          />
        </div>
        <div
          data-analytics-area="howtoplay-hero"
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className={CTA_BUTTON}>
            <a href={EVL_VIDEO_URL} target="_blank" rel="noreferrer">
              Watch the Video
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className={CTA_BUTTON}>
            <a href={currentRulebook.url} target="_blank" rel="noreferrer">
              Download Rules
            </a>
          </Button>
        </div>
      </section>

      {/* 1440px puts the 3fr column at ~1000px, the GIFs' true width. Wider upscales them. */}
      <div className="mx-auto max-w-[1440px] px-5">
        <FeatureRow
          title="How To Win"
          wideMedia
          media={
            <EvlArt
              {...evlArt.howToWin}
              alt="A fast-forwarded round, ending as the winner places an Element with a Heal action and Calls the Ritual"
              fallback="Picture a round of play, ending with a successful Call of the Ritual"
              className={GIF_CLASS}
            />
          }
        >
          <p>
            Every player has the option to <b>Call the Ritual</b> immediately after they take their turn.
            <br />
            <br />
            Calling the ritual reveals all top cards around the ritual circle. If the element icons match the ritual, you win
            the round. <b>Win 3 rounds and you win the game.</b>
            <br />
            <br />
            <b>Visual Right</b><br />
            A game fast forwards to the final turn.
            The player places a card as their turn's single action and then calls
            the ritual. Since the revealed cards match the center ritual card,
            they win the round. If they had been wrong, they would lose the round and play again next round.
            <EvlInfoDialog
              label="What happens when a player is removed from a round"
              title="Ritual Cleanse"
            >
              When a player is removed from a round, a <b>Ritual Cleanse</b> is
              performed where all their cards are removed from the game and all
              faceup incorrect cards are returned to their owner. Play then continues to the player on the left.
            </EvlInfoDialog>
          </p>
        </FeatureRow>

        <FeatureRow
          title="Your Turn"
          wideMedia
          mediaLeft
          media={
            <EvlArt
              {...evlArt.yourTurn}
              alt="Five players around a table mid-game, grinning and holding up their Team EvL cards"
              fallback="Picture a table of players holding up their cards mid-game"
              className={GIF_CLASS}
            />
          }
        >
          <strong className="text-ink">1. Take one action:</strong> Play,
          Heal, Peek, Draw or Challenge.
          <br /><br />
          <strong className="text-ink">2. Optionally,</strong> Call the
          Ritual and either win or lose the round. Play continues until someone calls the ritual correctly, or only one player remains.
          <EvlInfoDialog label="When to Call the Ritual" title="Take Care!">
            You can only Call the Ritual once per round. If you are wrong, you are out of the round. But if you don&rsquo;t
            do it soon enough, someone may beat you to it. They could win without you even trying. But they could also get it wrong, and then you could win on a later turn. Or if you wait forever, then everyone could get it wrong, and you win by default. Although, does that really feel like winning? You should probably think about that too.
            <br />
            <br />
            <strong className="text-ink">Too Long; Did&rsquo;t Read</strong>
            <br />
            I Call the Ritual!
          </EvlInfoDialog>
          <p className="mt-6">
            <strong className="text-ink">All the Time:</strong> Observe, question, make funny faces; Get information by any (polite, verbal) means necessary. Table talk is not only acceptable, it&rsquo;s EvL.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Play Facedown"
          wideMedia
          media={
            <EvlArt
              {...evlArt.play}
              alt="The Play action: an Element card placed facedown in the ritual circle"
              fallback="Picture an Element card placed facedown in the ritual circle"
              className={GIF_CLASS}
            />
          }
        >
          <p>
            You may play an Element facedown from your hand in an <b>empty spot or occupied</b> by a different facedown card. If you play on top of an existing card you must draw a <b>*Raven Card.</b>
            <br />
            <br />
            Any Element can go anywhere, so bluff away. Only the correct ones
            complete the ritual.
            <br />
            <br />
            <b>Hint: </b>Think of each card as a truth or a lie. Will you tell the truth to quietly advance the ritual, or lie to prevent others from winning?
          </p>
        </FeatureRow>

        <FeatureRow
          title="Peek"
          wideMedia
          mediaLeft
          media={
            <EvlArt
              {...evlArt.peek}
              alt="The Peek action: a card in the ritual circle looked at and returned turned 90°"
              fallback="Picture a card looked at and returned turned sideways"
              className={GIF_CLASS}
            />
          }
        >
          <p>
            Secretly look at a top card in the ritual circle, then put it back
            turned 90°.
            <br />
            <br />
            Each card can be peeked at only once, by one player.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Draw"
          wideMedia
          media={
            <EvlArt
              {...evlArt.draw}
              alt="The Draw action: a card drawn from the Raven Deck"
              fallback="Picture a card drawn from the Raven Deck"
              className={GIF_CLASS}
            />
          }
        >
          <p>
            Need more Elements, or want to leave the circle alone? Draw a card
            from the Raven Deck.
            <br />
            <br />
            The risk: it might be an EvL Seed.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Heal"
          wideMedia
          mediaLeft
          media={
            <EvlArt
              {...evlArt.heal}
              alt="The Heal action: an Element played faceup to return an EvL Seed to the Raven Deck"
              fallback="Picture an Element played faceup to return an EvL Seed"
              className={GIF_CLASS}
            />
          }
        >
          <p>
            Draw 2 EvL Seeds and you&rsquo;re out of the round.
            <br />
            <br />
            Already have 1? Play an Element faceup in its correct spot to return
            the Seed to the Raven Deck.
          </p>
        </FeatureRow>
      </div>

      <section className="bg-surface-alt mt-10 px-5 py-20 text-center sm:py-24">
        <h2 className="text-ink text-3xl font-black tracking-tight text-balance sm:text-4xl">
          Ready for the full rules?
        </h2>
        <p className="text-subtle mx-auto mt-4 mb-10 max-w-[46ch] text-lg">
          Challenge, Calling the Ritual and every other detail are in the
          rulebook.
        </p>
        <EvlCallToAction area="closing" className="mb-10" />
        <EvlBloomsFlourish />
      </section>
    </main>
  );
}
