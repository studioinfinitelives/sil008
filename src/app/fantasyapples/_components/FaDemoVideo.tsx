"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * A looping, muted demo clip. Clicking it toggles play/pause; there are no
 * other controls.
 *
 * Muted and played from an effect rather than relying on the `muted` and
 * `autoPlay` attributes alone: React sets `muted` as a property, so it is
 * missing from the static HTML, and browsers refuse unmuted autoplay. A
 * reduced-motion preference leaves it paused on the poster.
 */
export function FaDemoVideo({
  src,
  poster,
  width,
  height,
  label,
}: {
  src: string;
  poster: string;
  width: number;
  height: number;
  /** Describes the clip; the button's name says play or pause on top of it. */
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // `n` keys the overlay so a second click restarts the animation.
  const [flash, setFlash] = useState<{ icon: "play" | "pause"; n: number }>();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // Rejects when the browser blocks autoplay (e.g. Low Power Mode); the
    // poster stays up and a click starts it.
    Promise.resolve(video.play()).catch(() => {});
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    const icon = video.paused ? "play" : "pause";
    if (icon === "play") Promise.resolve(video.play()).catch(() => {});
    else video.pause();
    setFlash({ icon, n: (flash?.n ?? 0) + 1 });
  }

  const FlashIcon = flash?.icon === "play" ? Play : Pause;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`${playing ? "Pause" : "Play"}: ${label}`}
      className="relative block w-full cursor-pointer"
    >
      <video
        ref={ref}
        src={src}
        poster={poster}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        // Both axes `auto` so `max-h` shrinks the width with it; `w-full` here
        // would stretch the frame once the height cap kicks in.
        className="mx-auto block h-auto max-h-[80svh] w-auto max-w-full"
      />
      {flash && (
        <span
          key={flash.n}
          aria-hidden
          className="animate-out fade-out zoom-out-150 fill-mode-forwards pointer-events-none absolute inset-0 m-auto flex size-20 items-center justify-center rounded-full bg-black/50 text-white duration-700"
        >
          <FlashIcon className="size-9" fill="currentColor" />
        </span>
      )}
    </button>
  );
}
