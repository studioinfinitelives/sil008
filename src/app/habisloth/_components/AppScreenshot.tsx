import { FallbackImage } from "@/components/FallbackImage";

/**
 * A screenshot of the running app. Opaque and portrait, so unlike the
 * illustrations it gets corners, a shadow, and a narrower cap.
 *
 * Goes through `FallbackImage` because a missing screenshot is a normal state
 * while captures are still being taken. See that file for why only the browser
 * can detect one.
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
