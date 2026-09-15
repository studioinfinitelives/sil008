import Image from "next/image";
import { EVL_BLOOMS_HEIGHT, EVL_BLOOMS_WIDTH, evlBlooms } from "@/lib/cdn";

/**
 * Decorative closing flourish. `alt=""` keeps it out of the accessibility tree.
 *
 * BOTH files render and the `dark:` variant hides one, as `ThemeToggle` does
 * with its icons. A single `<Image>` switching `src` on theme cannot work: a
 * static export is written before the theme is known, and choosing in the
 * browser flashes the wrong ink on first paint.
 */
export function EvlBloomsFlourish() {
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
