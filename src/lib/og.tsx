/**
 * Shared layout for the Open Graph link-preview cards.
 *
 * Rendered by Satori (inside `next/og`'s `ImageResponse`), which is NOT a
 * browser. Breaking any of these fails the build with an opaque message:
 *
 * - Flexbox only. No grid, no float, no absolute positioning.
 * - Any element with more than one child needs an explicit `display: "flex"`.
 * - Inline styles only. Tailwind classes and the `globals.css` tokens do
 *   nothing here, so the palettes below duplicate that file. Keep them in step
 *   by hand.
 *
 * No `<img>` on purpose: Satori handles SVG poorly, and fetching from the CDN
 * would put a network round-trip in every build.
 */

/** The 1.91:1 frame every major unfurler crops to. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_CONTENT_TYPE = "image/png";

export interface OgPalette {
  background: string;
  /** Thick bar down the leading edge. */
  accent: string;
  title: string;
  tagline: string;
  eyebrow: string;
}

export const studioPalette: OgPalette = {
  background: "#16181a",
  accent: "#03f0e1",
  title: "#ffffff",
  tagline: "#a3a3a4",
  eyebrow: "#03f0e1",
};

export const habiSlothPalette: OgPalette = {
  background: "#f9d061",
  accent: "#6a412d",
  title: "#6a412d",
  tagline: "#8a6a54",
  eyebrow: "#6a412d",
};

export const teamEvlPalette: OgPalette = {
  background: "#140e17",
  accent: "#d8b162",
  title: "#ece6ee",
  tagline: "#b3a4b8",
  eyebrow: "#d8b162",
};

export interface OgCardProps {
  eyebrow: string;
  title: string;
  tagline: string;
  palette: OgPalette;
}

export function OgCard({ eyebrow, title, tagline, palette }: OgCardProps) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: palette.background,
      }}
    >
      <div style={{ width: 24, height: "100%", background: palette.accent }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          padding: "0 80px",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: palette.eyebrow,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.1,
            marginTop: 28,
            color: palette.title,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 34,
            lineHeight: 1.35,
            marginTop: 28,
            color: palette.tagline,
          }}
        >
          {tagline}
        </div>
      </div>
    </div>
  );
}
