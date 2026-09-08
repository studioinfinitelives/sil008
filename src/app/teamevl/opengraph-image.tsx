import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgCard, teamEvlPalette } from "@/lib/og";

/**
 * Team EvL's card. It takes the section's dark palette rather than the light
 * one — the game reads as violet-black wherever it is small.
 */

// See the note in `app/opengraph-image.tsx` — required under `output: "export"`.
export const dynamic = "force-static";

export const alt =
  "Team EvL — the UNcooperative card game of bluffing and social deduction";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Team EvL"
      title="The UNcooperative Card Game."
      tagline="Bluffing, social deduction, and general evil."
      palette={teamEvlPalette}
    />,
    size,
  );
}
