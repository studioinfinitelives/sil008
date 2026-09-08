/**
 * Shared layout for the Open Graph link-preview cards.
 *
 * These render through Satori (inside `next/og`'s `ImageResponse`), which is
 * *not* a browser. Three constraints follow, and breaking any of them fails the
 * build with an opaque message:
 *
 * - Only flexbox. No grid, no float, no `position: absolute` tricks.
 * - Any element with more than one child needs an explicit `display: "flex"`.
 * - Inline styles only — Tailwind classes and the tokens in `globals.css` mean
 *   nothing here, so the palette below is duplicated from that file by
 *   necessity. Keep the two in step by hand.
 *
 * Deliberately no `<img>`: the studio mark is an SVG, which Satori handles
 * poorly, and fetching it from the CDN would put a network round-trip on the
 * critical path of every build. A typographic card has neither problem.
 */

/** The 1.91:1 frame every major unfurler crops to. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_CONTENT_TYPE = "image/png";

export interface OgPalette {
  background: string;
  /** Thick bar down the leading edge — the strongest brand signal at thumbnail size. */
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
