import { FallbackImage } from "@/components/FallbackImage";

/**
 * A Team EvL row illustration. Sized to match `FeatureArt` so both product
 * pages lay out identically.
 *
 * Cannot be `FeatureArt`: that is a server component with no failure path, and
 * a filename typo here returns `200 text/html` rather than a 404, which only
 * the browser can detect. See `FallbackImage`.
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
   * Styles the art, not the stand-in. The default suits a transparent
   * illustration; opaque art wants a corner radius the drawn rows must not get.
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
