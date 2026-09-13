"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A CDN image with a written stand-in if it cannot load.
 *
 * A client component SOLELY for the failure path. The art host serves a
 * catch-all rewrite, so a missing file returns `200 text/html`, not a 404. No
 * build-time or server-side check can detect one. The browser can: an `<img>`
 * handed HTML fails to decode and fires `error`. That event is the only
 * reliable signal, hence the state. Do not convert this to a server component.
 *
 * The stand-in holds the image's aspect ratio, so nothing shifts on the swap.
 *
 * `className` styles the image, `fallbackClassName` the dashed box.
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
        // Inline rather than a class: the ratio comes from props, and Tailwind
        // only sees class names literally present in the source.
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
