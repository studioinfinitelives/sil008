import { ImageResponse } from "next/og";
import { habiSlothPalette, OG_CONTENT_TYPE, OG_SIZE, OgCard } from "@/lib/og";

/**
 * Habi Sloth's card. At this level of the tree it is inherited by
 * `/habisloth/privacy` and `/terms`, so a legal link unfurls as the product.
 */

// See the note in `app/opengraph-image.tsx` — required under `output: "export"`.
export const dynamic = "force-static";

export const alt = "Habi Sloth — a habit tracking app for the easy going";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Habi Sloth"
      title="A Habit Tracking App for the Easy Going."
      tagline="Set a goal for the week. Habi Sloth works out what that means today."
      palette={habiSlothPalette}
    />,
    size,
  );
}
