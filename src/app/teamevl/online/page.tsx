import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import {
  CTA_BUTTON,
  ONLINE_BUTTON,
} from "@/app/teamevl/_components/EvlCallToAction";
import { EvlArt } from "@/app/teamevl/_components/EvlArt";
import { EvlLinkDrawer } from "@/app/teamevl/_components/EvlLinkDrawer";
import { EvlPhones } from "@/app/teamevl/_components/EvlPhones";
import { FeatureRow } from "@/components/FeatureRow";
import { Button } from "@/components/ui/button";
import { evlArt } from "@/lib/cdn";
import { EVL_PLAY_URL } from "@/lib/evlLinks";

const DESCRIPTION =
  "Team EvL, live in your browser. Open a private table and bluff with 2–5 players, or fill the seats with bots. No ads, nothing to buy.";

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Team EvL Online",
    description: DESCRIPTION,
    alternates: { canonical: "/teamevl/online" },
    // Metadata merges SHALLOWLY: declaring `openGraph` here drops the image
    // inherited from `teamevl/opengraph-image.jpg` unless it is carried over.
    openGraph: {
      title: "Team EvL Online",
      description: DESCRIPTION,
      url: "/teamevl/online",
      images: (await parent).openGraph?.images,
    },
  };
}

/** The game's own legal pages, linked and never copied. */
const LEGAL_LINKS = [
  { href: `${EVL_PLAY_URL}/terms.html`, label: "Terms" },
  { href: `${EVL_PLAY_URL}/privacy.html`, label: "Privacy" },
] as const;

const FACTS = [
  { value: "2–5", label: "players at a table" },
  { value: "Bots", label: "for the empty seats" },
  { value: "0", label: "ads, ever" },
  { value: "Free", label: "nothing to buy" },
] as const;

/** A soft gold bloom behind the hero phones. Decorative. */
const GLOW =
  "pointer-events-none absolute inset-x-0 top-1/4 -z-10 mx-auto h-2/3 max-w-3xl rounded-full bg-[radial-gradient(closest-side,var(--color-brand),transparent)] opacity-25 blur-3xl";

/**
 * The Team EvL Online product page (`../sil011`, live at teamevl.com). Same
 * shape as the other product pages: pitch, alternating feature rows, closing
 * call to action. The black and gold come from `data-section="evlonline"`.
 */
export default function Page() {
  return (
    <main data-section="evlonline" className="bg-canvas flex-1">
      <EvlLinkDrawer />

      <section className="flex flex-col items-center gap-6 px-5 pt-20 pb-10 text-center sm:pt-28">
        <span className="border-brand text-brand rounded-full border px-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase">
          Team EvL Online
        </span>
        <h1 className="text-ink max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
          The whole ritual.{" "}
          <span className="from-brand-bright to-brand bg-linear-to-b bg-clip-text text-transparent">
            Live in your browser.
          </span>
        </h1>
        <p className="text-subtle max-w-[44ch] text-lg sm:text-xl">
          The UNcooperative card game of bluffing, now at a table you can open
          from anywhere. Summon the Demon. Save the World.
        </p>
        <div
          data-analytics-area="hero"
          className="mt-2 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            asChild
            size="lg"
            className={`${CTA_BUTTON} ${ONLINE_BUTTON}`}
          >
            <a href={EVL_PLAY_URL} data-analytics-id="play-online-hero">
              Play Team EvL Online
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className={CTA_BUTTON}>
            <Link href="/teamevl/howtoplay">How to Play</Link>
          </Button>
        </div>
        <p className="text-subtle text-sm">
          Free at teamevl.com. No ads. Nothing to buy.
        </p>

        <div className="relative isolate mt-10 w-full max-w-3xl">
          <div aria-hidden="true" className={GLOW} />
          {/* The middle phone leads; the outer two sit a step back. */}
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <div className="flex-1 opacity-90">
              <EvlArt
                {...evlArt.onlineLobby}
                alt="A private table in Team EvL Online: a table code, an invite link, five seats and the house rules"
                fallback="Picture a private table with a code to share"
                className="border-line max-w-56 rounded-3xl border shadow-2xl"
              />
            </div>
            <div className="flex-[1.25]">
              <EvlArt
                {...evlArt.onlineFour}
                alt="A four-player Team EvL Online table: cards stacked around the Malphidia Ritual Card while an opponent thinks"
                fallback="Picture a full table gathered around the Ritual Card"
                className="border-brand/60 max-w-72 rounded-3xl border shadow-2xl"
              />
            </div>
            <div className="flex-1 opacity-90">
              <EvlArt
                {...evlArt.onlineWin}
                alt="A round won in Team EvL Online: Andralux summoned, with the standings below"
                fallback="Picture the Ritual Card claimed and the standings"
                className="border-line max-w-56 rounded-3xl border shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section aria-label="At a glance" className="px-5 py-10">
        <dl className="border-line bg-surface mx-auto grid max-w-4xl grid-cols-2 gap-y-8 rounded-3xl border px-6 py-8 text-center md:grid-cols-4">
          {FACTS.map((fact) => (
            <div key={fact.label} className="flex flex-col-reverse gap-1">
              <dt className="text-subtle text-sm">{fact.label}</dt>
              <dd className="text-brand text-3xl font-black tracking-tight">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        <FeatureRow
          title="A private table in seconds"
          media={
            <EvlPhones
              screens={[
                {
                  ...evlArt.onlineLobby,
                  alt: "The private table lobby: table code RV7Q, an invite link, five seats, a difficulty slider and the turn timer",
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
            Open a table, send the code or the invite link, and your group is
            in. No installs, no lobbies full of strangers.
          </p>
          <p className="mt-4">
            Short a player? Bots take the empty seats, from Friend to Pure EvL.
          </p>
        </FeatureRow>

        <FeatureRow
          title="One action. Make it count."
          mediaLeft
          media={
            <EvlPhones
              screens={[
                {
                  ...evlArt.onlinePlay,
                  alt: "Your turn in Team EvL Online: the open spots around the Ritual Card light up, with your hand of Element cards below",
                  fallback: "Picture the open spots lighting up on your turn",
                },
                {
                  ...evlArt.onlinePeek,
                  alt: "A Peek in Team EvL Online: an Air card shown only to you, with the verdict that Rook told the truth",
                  fallback: "Picture a card only you can see",
                },
              ]}
            />
          }
        >
          <p>
            Every turn plays like the tabletop game. The table shows where a
            card can go, and a Peek is yours alone.
          </p>
          <p className="mt-4">Then tell the table whatever suits you.</p>
        </FeatureRow>

        <FeatureRow
          title="Call their bluff"
          media={
            <EvlPhones
              screens={[
                {
                  ...evlArt.onlineEmotes,
                  alt: "A card's actions in Team EvL Online: who played it and who peeked, emotes such as Lies! and Truth, and the Peek and Challenge buttons",
                  fallback: "Picture a card with Lies! and Truth emotes",
                },
                {
                  ...evlArt.onlineChallenge,
                  alt: "A Correct Challenge in Team EvL Online: Mara's card was False, and a bonus action is offered",
                  fallback: "Picture a False card flipped faceup",
                },
              ]}
            />
          }
        >
          <p>
            Throw a &ldquo;Lies!&rdquo; at a suspicious card, or go further and
            Challenge it. Be right and their False card stays faceup for the
            rest of the round.
          </p>
          <p className="mt-4">
            The hidden cards stay hidden, so the only cheating is the kind the
            rules encourage.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Call the Ritual"
          mediaLeft
          media={
            <EvlPhones
              screens={[
                {
                  ...evlArt.onlineCall,
                  alt: "Call the Ritual in Team EvL Online: three of four cards checked True, one still unknown, with Pass and Call Ritual buttons",
                  fallback: "Picture three cards checked and one unknown",
                },
                {
                  ...evlArt.onlineWin,
                  alt: "A round won in Team EvL Online: Andralux summoned, with the standings below",
                  fallback: "Picture the Ritual Card claimed and the standings",
                },
              ]}
            />
          }
        >
          <p>
            The table keeps track of what you have checked. The last card is
            still a leap of faith: Call it right and the Demon is yours, Call it
            wrong and you are out of the round.
          </p>
        </FeatureRow>

        <FeatureRow
          title="Your table, your rules"
          media={
            <EvlPhones
              screens={[
                {
                  ...evlArt.onlineFour,
                  alt: "A four-player Team EvL Online table with a turn timer counting down beside the player whose turn it is",
                  fallback: "Picture a full table with a turn timer running",
                },
              ]}
              className="max-w-60"
            />
          }
        >
          <p>
            Slide the difficulty from Easy to EvL, set how many Rituals win the
            game, and pick a turn timer or switch it off.
          </p>
          <p className="mt-4">
            If someone drops, a bot can hold their seat until they are back.
          </p>
        </FeatureRow>
      </div>

      <section
        data-analytics-area="closing"
        className="bg-surface-alt border-line mt-10 border-t px-5 py-20 text-center sm:py-24"
      >
        <h2 className="text-ink text-3xl font-black tracking-tight text-balance sm:text-4xl">
          Only the most EvL can win.
        </h2>
        <Button
          asChild
          size="lg"
          className={`${CTA_BUTTON} ${ONLINE_BUTTON} mt-8`}
        >
          <a href={EVL_PLAY_URL} data-analytics-id="play-online-closing">
            Play Team EvL Online
          </a>
        </Button>
        <p className="text-subtle mt-6">
          Prefer cardboard?{" "}
          <Link
            href="/teamevl"
            className="text-link underline underline-offset-4"
          >
            Meet the card game
          </Link>
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-5 pb-6">
        <nav
          className="border-line mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-sm"
          aria-label="Team EvL Online legal"
        >
          {LEGAL_LINKS.map((item) => (
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
