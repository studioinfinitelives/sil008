import { FallbackImage } from "@/components/FallbackImage";

/**
 * A screenshot of the running app.
 *
 * Unlike the illustrations this is a full opaque phone screen, so it gets
 * rounded corners and a shadow to read as a device rather than as a rectangle
 * dropped on the page. It is capped narrow because it is a tall portrait shot:
 * at the illustrations' width it would be twice the height of its own row.
 *
 * Missing screenshots are the normal case here while captures are still being
 * taken, so this goes through {@link FallbackImage} — which explains why a
 * client-side `error` event is the only way to notice one.
 */

const FALLBACK_TEXT = "Picture a Beautiful wheel full of habits";

export function AppScreenshot({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <FallbackImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      fallback={FALLBACK_TEXT}
      className="max-w-[320px] rounded-3xl shadow-xl"
      fallbackClassName="max-w-[320px] rounded-3xl"
    />
  );
}
