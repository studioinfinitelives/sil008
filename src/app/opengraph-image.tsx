import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgCard, studioPalette } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";

/**
 * Default link-preview card for the whole site.
 *
 * Next resolves the nearest `opengraph-image` walking up the route tree, so
 * this covers every route that does not define its own — `/blog` and
 * `/blog/[slug]` included.
 */

// Required under `output: "export"`. An image route is a Route Handler, and
// Next refuses to export one that has not declared itself static — without this
// the build fails outright rather than silently omitting the PNG.
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
