import { EVL_PLAY_URL } from "@/lib/evlLinks";
import { cn } from "@/lib/utils";

const POINTS = 16;

/** A starburst outline in a 100×100 box, alternating outer and inner radius. */
const BURST = Array.from({ length: POINTS * 2 }, (_, i) => {
  const radius = i % 2 === 0 ? 50 : 41;
  const angle = (Math.PI * i) / POINTS;
  return `${(50 + radius * Math.sin(angle)).toFixed(2)},${(50 - radius * Math.cos(angle)).toFixed(2)}`;
}).join(" ");

/**
 * The "New" burst sticker announcing the online game, linking to it.
 *
 * Every animation is `motion-safe:`. The blanket reduced-motion rule in
 * `globals.css` only shortens durations, and an infinite spin shortened to
 * 0.01ms flickers rather than stopping.
 */
export function EvlNewSticker({ className }: { className?: string }) {
  return (
    <a
      href={EVL_PLAY_URL}
      data-analytics-id="play-online-sticker"
      aria-label="New: play Team EvL online at teamevl.com"
      className={cn(
        "group focus-visible:outline-ink relative grid size-32 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 sm:size-36",
        "motion-safe:animate-[evl-sticker-wobble_2.8s_ease-in-out_infinite]",
        className,
      )}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="fill-evl-blood absolute inset-0 size-full drop-shadow-lg motion-safe:animate-[spin_24s_linear_infinite]"
      >
        <polygon points={BURST} />
        <circle
          cx="50"
          cy="50"
          r="35"
          className="stroke-evl-gold fill-none"
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />
      </svg>
      <span className="relative flex -rotate-12 flex-col items-center leading-none text-white transition-transform group-hover:scale-110">
        <span className="text-evl-gold text-3xl font-black tracking-tight uppercase sm:text-4xl">
          New!
        </span>
        <span className="mt-1 text-[0.7rem] font-bold tracking-wider uppercase sm:text-xs">
          Play online
        </span>
      </span>
    </a>
  );
}
