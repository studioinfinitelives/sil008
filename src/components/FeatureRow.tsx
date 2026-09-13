import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * One alternating feature row: copy on one side, media on the other. Collapses
 * to a stacked column on narrow screens.
 *
 * The text is always FIRST in the DOM and moved with `order` on wide screens
 * only, so reading order stays heading-then-media for a screen reader and a
 * crawler whichever side it paints on.
 */

interface FeatureRowProps {
  title: string;
  children: ReactNode;
  media: ReactNode;
  /** Put the media on the left on wide screens. */
  mediaLeft?: boolean;
}

export function FeatureRow({
  title,
  children,
  media,
  mediaLeft = false,
}: FeatureRowProps) {
  return (
    <section className="grid items-center gap-10 py-14 md:grid-cols-2 md:gap-16 md:py-24">
      <div
        className={cn(
          "flex flex-col gap-4 text-center md:text-left",
          mediaLeft && "md:order-2",
        )}
      >
        <h2 className="text-ink text-3xl font-black tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        <div className="text-subtle mx-auto max-w-[46ch] text-lg md:mx-0">
          {children}
        </div>
      </div>
      <div className={cn(mediaLeft && "md:order-1")}>{media}</div>
    </section>
  );
}

/**
 * A transparent-PNG illustration, sitting directly on the page with no panel.
 *
 * Width and height are load-bearing: `next/image` is unoptimized site-wide, so
 * they are the only thing reserving the box. They must be the file's true
 * pixels — a guessed ratio shifts the row as the art arrives.
 */
export function FeatureArt({
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
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="mx-auto h-auto w-full max-w-md"
    />
  );
}
