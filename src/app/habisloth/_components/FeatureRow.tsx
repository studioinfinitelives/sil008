import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * One alternating feature row: a short written bite on one side, something to
 * look at or play with on the other.
 *
 * The copy is deliberately small — a heading of a few words and a sentence or
 * two — because the media is doing the explaining. Rows alternate sides down
 * the page, and collapse to a single stacked column on narrow screens.
 *
 * The text always comes first in the DOM and is moved with `order` on wide
 * screens only, so the reading order stays heading-then-media for a screen
 * reader and a crawler regardless of which side it is painted on.
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
 * An illustration from the app's own CDN.
 *
 * Every one of these is a transparent PNG, so it sits directly on the page with
 * no panel behind it — a filled card would put a hard edge around art that was
 * drawn to have none.
 *
 * `next/image` is unoptimized site-wide (there is no optimizer in a static
 * export), so width and height are load-bearing: without them the browser has
 * no aspect ratio to reserve and the row jumps as the art arrives. They are the
 * files' true pixel dimensions — a guessed ratio reserves the wrong box and
 * shifts the row anyway.
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

/**
 * A screenshot of the running app.
 *
 * Unlike the illustrations this is a full opaque phone screen, so it gets
 * rounded corners and a shadow to read as a device rather than as a rectangle
 * dropped on the page. It is capped narrow because it is a tall portrait shot:
 * at the illustrations' width it would be twice the height of its own row.
 */
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
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="mx-auto h-auto w-full max-w-[320px] rounded-3xl shadow-xl"
    />
  );
}

/**
 * Stands in for a screenshot that does not exist yet.
 *
 * Capturing them needs a real account and a scrub pass (plan §3), so the rows
 * that want one say so out loud rather than shipping a row that looks broken.
 */
export function MediaPlaceholder({ label }: { label: string }) {
  return (
    <div className="border-line text-subtle flex aspect-[4/3] w-full max-w-md items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center text-sm">
      {label}
    </div>
  );
}
