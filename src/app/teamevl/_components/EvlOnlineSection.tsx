import { EvlArt } from "@/app/teamevl/_components/EvlArt";
import { CTA_BUTTON } from "@/app/teamevl/_components/EvlCallToAction";
import { FeatureRow } from "@/components/FeatureRow";
import { Button } from "@/components/ui/button";
import { evlArt } from "@/lib/cdn";
import { EVL_PLAY_URL } from "@/lib/evlLinks";

type Screen = (typeof evlArt)[keyof typeof evlArt] & {
  alt: string;
  fallback: string;
};

/** Two phone screens side by side, the second dropped a little. */
function PhonePair({ screens }: { screens: [Screen, Screen] }) {
  return (
    <div className="mx-auto flex max-w-md items-start justify-center gap-4 sm:gap-6">
      {screens.map((screen, index) => (
        <div
          key={screen.src}
          className={index === 1 ? "mt-10 flex-1" : "flex-1"}
        >
          <EvlArt
            {...screen}
            className="border-line max-w-60 rounded-3xl border shadow-xl"
          />
        </div>
      ))}
    </div>
  );
}

/**
 * The online game's band on /teamevl: two feature rows and its own button.
 *
 * TWO rows, so the `mediaLeft` alternation of the rows after it is unchanged.
 */
export function EvlOnlineSection() {
  return (
    <section
      id="online"
      data-analytics-area="online"
      className="bg-surface-alt px-5 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-center">
          <span className="bg-evl-blood rounded-full px-4 py-1.5 text-xs font-bold tracking-wider text-white uppercase">
            New · Team EvL Online
          </span>
        </p>
        <FeatureRow
          title="Now summoning online"
          media={
            <PhonePair
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
            code or invite link, and play with 2–5 players wherever they are.
            <br />
            <br />
            Short a player? Bots take the empty seats, from Friend to Pure EvL.
            No ads. Nothing to buy.
          </p>
        </FeatureRow>
        <FeatureRow
          title="Bluff from anywhere"
          mediaLeft
          media={
            <PhonePair
              screens={[
                {
                  ...evlArt.onlinePeek,
                  alt: "A Peek in Team EvL Online: an Air card shown only to you, with the verdict that Rook told the truth",
                  fallback: "Picture a card only you can see",
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
            Peek in private, then tell the table whatever suits you. Challenge a
            liar, Call the Ritual, and watch someone&rsquo;s plan collapse in
            real time.
            <br />
            <br />
            The hidden cards stay hidden, so the only cheating is the kind the
            rules encourage.
          </p>
        </FeatureRow>
        <div className="flex justify-center pb-4">
          <Button asChild size="lg" className={CTA_BUTTON}>
            <a href={EVL_PLAY_URL} data-analytics-id="play-online-section">
              Play Team EvL Online
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
