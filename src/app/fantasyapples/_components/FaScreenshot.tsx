import { FallbackImage } from "@/components/FallbackImage";

/**
 * A screenshot of the running app. Through `FallbackImage` because the art is
 * published separately (`make deploy-cdn`), so a page build can precede it.
 */

const FALLBACK_TEXT = "Picture a grid full of hockey stats";

export function FaScreenshot({
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
  // Desktop captures span the row; phone-width sheets get a narrower cap.
  const cap = width > height ? "" : "max-w-[360px]";
  return (
    <FallbackImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      fallback={FALLBACK_TEXT}
      className={`${cap} rounded-2xl shadow-xl`}
      fallbackClassName={`${cap} rounded-2xl`}
    />
  );
}
