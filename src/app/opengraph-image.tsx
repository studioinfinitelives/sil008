import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgCard, studioPalette } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";

/**
 * Default link-preview card. Next resolves the nearest `opengraph-image` up the
 * route tree, so this covers every route without its own.
 */

// REQUIRED under `output: "export"`: an image route is a Route Handler, and
// Next refuses to export one that has not declared itself static. Omitting this
// fails the build rather than silently skipping the PNG.
export const dynamic = "force-static";

export const alt = SITE_NAME;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Infinite Lives"
      title="Studio Infinite Lives"
      tagline="We build Habi Sloth and Team EvL."
      palette={studioPalette}
    />,
    size,
  );
}
