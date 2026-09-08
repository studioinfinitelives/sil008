import { FallbackImage } from "@/components/FallbackImage";

/**
 * A Team EvL row illustration.
 *
 * Every one of these is now on the CDN, so in practice no row draws its
 * stand-in. It stays a client component all the same: the art host serves a
 * catch-all rewrite, so a filename typo comes back `200 text/html` rather than
 * a 404 and only the browser can tell — see `FallbackImage`. That is why this
 * cannot be `FeatureArt`, which is a server component with no failure path.
 *
 * The stand-in text differs per row because each one is standing in for a
 * different picture.
 *
 * Sizing matches `FeatureArt` so the Team EvL rows and the Habi Sloth ones are
 * laid out identically.
 */
export function EvlArt({
  src,
  alt,
  width,
  height,
  fallback,
  className = "max-w-md",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Describes the picture this row is missing. */
  fallback: string;
  /**
   * Overrides the look of the art itself, not of the stand-in. The default
   * suits a transparent illustration sitting straight on the page; art with its
   * own opaque edges wants a corner radius the drawn rows must not get.
   */
  className?: string;
}) {
  return (
    <FallbackImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      fallback={fallback}
      className={className}
      fallbackClassName="max-w-md rounded-2xl"
    />
  );
}
