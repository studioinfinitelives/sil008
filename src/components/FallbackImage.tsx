"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A CDN image with a written stand-in if it cannot load.
 *
 * A client component solely for the failure path. The art CDN is the app's own
 * Firebase Hosting, which serves a **catch-all rewrite** — a file that is not
 * there comes back as `200 text/html` (the Flutter shell), not as a 404. So no
 * server-side or build-time reachability check can tell a real image from a
 * missing one, and `next/image` would render a broken-image icon either way.
 * What does work is the browser: an `<img>` handed HTML fails to decode and
 * fires `error`, which is true for a genuine 404 as well. That one event is the
 * only reliable signal available, hence the state.
 *
 * The stand-in holds the image's exact aspect ratio, so the row is laid out
 * identically whether the art arrives or not and nothing shifts when the swap
 * happens.
 *
 * Callers own the look of both states: `className` styles the image and
 * `fallbackClassName` the dashed box, because a phone screenshot and a
 * transparent illustration want different treatments.
 */
export function FallbackImage({
  src,
  alt,
  width,
  height,
  fallback,
  className,
  fallbackClassName,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** What to say in place of the picture that did not load. */
  fallback: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        // The ratio is inline rather than a class because it comes from props;
        // Tailwind can only see class names it can read in the source.
        style={{ aspectRatio: `${width} / ${height}` }}
        className={cn(
          "border-line text-subtle mx-auto flex w-full items-center justify-center border-2 border-dashed p-8 text-center text-lg text-balance",
          fallbackClassName,
        )}
      >
        {fallback}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      onError={() => setFailed(true)}
      className={cn("mx-auto h-auto w-full", className)}
    />
  );
}
