import { EvlArt } from "@/app/teamevl/_components/EvlArt";
import { cn } from "@/lib/utils";

export type EvlScreen = {
  src: string;
  width: number;
  height: number;
  alt: string;
  fallback: string;
};

/** Screenshots of the online game as phones side by side, each a step lower. */
export function EvlPhones({
  screens,
  className,
}: {
  screens: readonly EvlScreen[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-md items-start justify-center gap-4 sm:gap-6",
        className,
      )}
    >
      {screens.map((screen, index) => (
        <div
          key={screen.src}
          className="flex-1"
          // Inline, not a class: Tailwind only sees literal class names.
          style={{ marginTop: `${index * 2.5}rem` }}
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
