"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * A screenshot of the running app, with a written stand-in if it cannot load.
 *
 * Unlike the illustrations this is a full opaque phone screen, so it gets
 * rounded corners and a shadow to read as a device rather than as a rectangle
 * dropped on the page. It is capped narrow because it is a tall portrait shot:
 * at the illustrations' width it would be twice the height of its own row.
 *
 * A client component solely for the failure path. The art CDN is the app's own
 * Firebase Hosting, which serves a **catch-all rewrite** — a file that is not
 * there comes back as `200 text/html` (the Flutter shell), not as a 404. So no
 * server-side or build-time reachability check can tell a real screenshot from
 * a missing one, and `next/image` would render a broken-image icon either way.
 * What does work is the browser: an `<img>` handed HTML fails to decode and
 * fires `error`, which is true for a genuine 404 as well. That one event is the
 * only reliable signal available, hence the state.
 *
 * The stand-in holds the image's exact aspect ratio, so the row is laid out
 * identically whether the screenshot arrives or not and nothing shifts when the
 * swap happens.
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
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        // The ratio is inline rather than a class because it comes from props;
        // Tailwind can only see class names it can read in the source.
        style={{ aspectRatio: `${width} / ${height}` }}
        className="border-line text-subtle mx-auto flex w-full max-w-[320px] items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center text-lg text-balance"
      >
        {FALLBACK_TEXT}
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
      className="mx-auto h-auto w-full max-w-[320px] rounded-3xl shadow-xl"
    />
  );
}
