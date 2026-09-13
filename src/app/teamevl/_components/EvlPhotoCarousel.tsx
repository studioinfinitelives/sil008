"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { evlPhotos } from "@/app/teamevl/_components/evlPhotos";

/**
 * A turntable of photographs, spaced around a cylinder turning on a vertical
 * axis. Holds one column of a `FeatureRow`.
 *
 * SIX CARDS, ANY NUMBER OF PHOTOGRAPHS. The ring is six slots and `evlPhotos`
 * is a queue behind it: a card swaps to the next photograph at the instant it
 * reaches the back of the ring, out of sight. Adding a photograph to that list
 * is the whole job.
 *
 * GEOMETRY IS A CONSTANT, NOT A MEASUREMENT. For N cards of width W separated
 * by G the radius is `(W + G) / 2 / tan(180° / N)`; at six cards that is
 * `(W + G) × 0.866`. Two CSS variables drive it, so no `ResizeObserver`.
 *
 * `overflow: hidden` GOES ON THE STAGE, NEVER THE RING. Any `overflow` other
 * than `visible` forces that element's `transform-style` to `flat`. The stage
 * has no `preserve-3d` so clipping is safe there; clipping the ring collapses
 * the carousel into stacked rectangles.
 *
 * `backface-visibility` is deliberately left alone, so far-side cards show
 * through the gaps mirrored.
 */

/** Cards on the ring. Goes with `--deck-r`'s 0.866 and with `SEAM` below. */
const SLOTS = 6;

/** Photographs in the queue. */
const COUNT = evlPhotos.length;

/** Degrees between neighbours around the ring. */
const SEG = 360 / SLOTS;

/**
 * How far ahead of the front card a slot carries the photograph that is coming
 * rather than the one that has been. Slots 0-2 are the front and the two
 * arriving; 3-5 have gone. This puts the seam, the one place a card changes
 * what it shows, at the back of the ring. Any other value swaps in plain sight.
 */
const SEAM = 2;

const BEAT_MS = 1000;

/** Single steps before the ring winds on fast. */
const STEPS_PER_CYCLE = 4;

/**
 * The fast-forward is ONE PASS THROUGH THE QUEUE, which is what brings it back
 * to the photograph it left on. The ring does not land on a whole number of
 * turns and does not need to.
 *
 * It is ONE transition of `COUNT` segments, not `COUNT` of one: back-to-back
 * short tweens stutter, since each eases separately and each is a fresh style
 * commit for the compositor.
 */
const FAST_STEPS = COUNT;
/** Photos a second during the burst. */
const FAST_RATE = 10;
const FAST_MS = (FAST_STEPS / FAST_RATE) * 1000;

/**
 * A breath after the sweep. Without it the next step is scheduled for the exact
 * millisecond the sweep lands, and a timer firing a frame early interrupts the
 * transform mid-flight.
 */
const SETTLE_MS = 80;

/** A shade under the beat, so a move settles before the next is scheduled. */
const STEP_MS = 600;
const MANUAL_MS = 500;

/** `SWEEP` is symmetrical so the burst winds up and down from rest. */
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const SWEEP = "cubic-bezier(0.45, 0, 0.55, 1)";

/**
 * Motion preference and tab visibility, via `useSyncExternalStore` rather than
 * an effect seeding state: these ARE external stores, and reading them in an
 * effect renders twice on mount and trips `react-hooks/set-state-in-effect`.
 *
 * The third argument is the server snapshot. A static export is written before
 * any preference is known, so it claims "no preference, tab visible" and the
 * subscription corrects it on the first client render.
 */
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function readReducedMotion() {
  return typeof window.matchMedia === "function"
    ? window.matchMedia(REDUCED_MOTION).matches
    : false;
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function readVisibility() {
  return document.visibilityState === "visible";
}

export function EvlPhotoCarousel() {
  /**
   * Angle, sweep length and easing as ONE value: all three must change on the
   * same commit, or the fast-forward inherits the single step's easing or
   * overwrites it a frame late.
   *
   * `step` counts up forever and is NEVER taken modulo. Wrapping it makes the
   * fast-forward a no-op and snaps back at every crossing of the last photo.
   */
  const [spin, setSpin] = useState({ step: 0, ms: 0, ease: EASE });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  /** Position in the four-steps-then-a-fast-forward cycle. */
  const beat = useRef(0);

  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  // Without this the timer chain keeps firing in a backgrounded tab and the
  // reader returns to a ring that has raced on.
  const visible = useSyncExternalStore(
    subscribeVisibility,
    readVisibility,
    () => true,
  );

  /** The queue's position, not a slot. */
  const front = ((spin.step % COUNT) + COUNT) % COUNT;
  const running = !paused && !hovered && !reduced && visible;

  /**
   * Four single steps, then a fast-forward through the whole queue, repeating.
   *
   * A `setTimeout` chain rather than `setInterval`: the burst is not the same
   * move as a step, and a chain restarts cleanly from a pause instead of firing
   * whatever it owed the moment the reader lets go.
   */
  useEffect(() => {
    if (!running) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      if (beat.current < STEPS_PER_CYCLE) {
        beat.current += 1;
        setSpin((current) => ({
          step: current.step + 1,
          ms: STEP_MS,
          ease: EASE,
        }));
        timer = setTimeout(tick, BEAT_MS);
      } else {
        beat.current = 0;
        setSpin((current) => ({
          step: current.step + FAST_STEPS,
          ms: FAST_MS,
          ease: SWEEP,
        }));
        timer = setTimeout(tick, FAST_MS + SETTLE_MS);
      }
    };
    timer = setTimeout(tick, BEAT_MS);
    return () => clearTimeout(timer);
  }, [running]);

  /**
   * One photo by hand. Resetting the beat matters: land mid-cycle and the
   * fast-forward runs away with the step the reader just asked for.
   */
  function nudge(direction: 1 | -1) {
    beat.current = 0;
    setSpin((current) => ({
      step: current.step + direction,
      ms: reduced ? 0 : MANUAL_MS,
      ease: EASE,
    }));
  }

  return (
    /*
      `data-analytics="off"` covers the whole carousel: the delegated tracker
      would otherwise fill the reports with `button_click / Next photo`.

      The width variables live here so one number sets the card, the ring radius
      and the stage height together. `--deck-r` and `--deck-h` resolve against
      whichever `--deck-w` the breakpoints leave winning on this same element,
      so the three cannot drift apart. `--deck-gap` widens the ring rather than
      narrowing the photographs.
    */
    <section
      aria-roledescription="carousel"
      aria-label="Photos from real games of Team EvL"
      data-analytics="off"
      className="mx-auto flex w-full flex-col items-center gap-5 [--deck-gap:3.5rem] [--deck-h:calc(var(--deck-w)*4/3)] [--deck-r:calc((var(--deck-w)+var(--deck-gap))*0.866)] [--deck-w:190px] sm:[--deck-w:230px] lg:[--deck-w:260px]"
    >
      {/*
        The stage owns the perspective and the clip, and takes the pointer:
        hover holds the ring still, click toggles a hold. Neither is reachable
        from a keyboard, which is why the pause button below is not optional.
      */}
      <div
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => setPaused((held) => !held)}
        // Short perspective, roughly two and a half card widths. The shorter it
        // is the harder the far side falls away, which is what gives depth.
        style={{ perspective: "700px" }}
        className="relative h-[calc(var(--deck-h)+3rem)] w-full cursor-pointer overflow-hidden"
      >
        {/*
          The ring. The negative `translateZ` pulls it back by exactly the
          radius each card is pushed out by, so the front card lands on the
          perspective plane and renders at natural size rather than enlarged.
        */}
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `translateZ(calc(var(--deck-r) * -1)) rotateY(${-spin.step * SEG}deg)`,
            transitionProperty: "transform",
            transitionDuration: `${reduced ? 0 : spin.ms}ms`,
            transitionTimingFunction: spin.ease,
            willChange: "transform",
          }}
          className="absolute inset-0"
        >
          {Array.from({ length: SLOTS }, (_, slot) => {
            /*
              Which photograph this slot carries: slots ahead of the front hold
              what is coming, those behind hold what has gone, and the jump
              happens at the back of the ring.

              KEYED BY SLOT, not by photograph. A slot is a fixed place whose
              contents change; keying by `photo.src` would make React tear the
              card out at the seam and the browser drop the layer mid-turn.
            */
            const offset = (((slot - spin.step) % SLOTS) + SLOTS) % SLOTS;
            const ahead = offset <= SEAM ? offset : offset - SLOTS;
            const index = (((front + ahead) % COUNT) + COUNT) % COUNT;
            const photo = evlPhotos[index];
            // `index` is taken modulo a list the page could not render at all
            // if it were empty; `noUncheckedIndexedAccess` cannot know that.
            if (!photo) return null;
            const isFront = offset === 0;
            return (
              <figure
                key={slot}
                // Only the front card is reachable. The rest repeat the row's
                // content as far as a screen reader is concerned, and half face
                // away. Same device the closed link drawer uses.
                inert={!isFront}
                aria-hidden={isFront ? undefined : true}
                style={{
                  transform: `translate(-50%, -50%) rotateY(${slot * SEG}deg) translateZ(var(--deck-r))`,
                }}
                // `opacity-95` goes on the figure so the card's background
                // fades with it; fading only the image leaves a solid panel.
                className="bg-surface-alt absolute top-1/2 left-1/2 h-[var(--deck-h)] w-[var(--deck-w)] overflow-hidden rounded-2xl opacity-95 shadow-[0_12px_30px_-10px_rgb(0_0_0/0.45)]"
              >
                {/* No `sizes`: unoptimized, so there is no `srcset` to pick from. */}
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  style={{ objectPosition: photo.focus }}
                  className="h-full w-full object-cover"
                />
              </figure>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ControlButton label="Previous photo" onClick={() => nudge(-1)}>
          <ChevronLeft aria-hidden="true" className="size-5" />
        </ControlButton>
        {/*
          Announced but not drawn. Live ONLY while the ring is still: a region
          that speaks every second during autoplay is unusable.
        */}
        <p aria-live={running ? "off" : "polite"} className="sr-only">
          {front + 1} of {COUNT}
        </p>
        {/*
          Required by WCAG 2.2.2: this moves by itself for longer than five
          seconds beside text. Hover and click stop it for a mouse and nobody
          else. Dropped only when nothing is moving in the first place.
        */}
        {reduced ? null : (
          <ControlButton
            label={paused ? "Play the carousel" : "Pause the carousel"}
            onClick={() => setPaused((held) => !held)}
          >
            {paused ? (
              <Play aria-hidden="true" className="size-4" />
            ) : (
              <Pause aria-hidden="true" className="size-4" />
            )}
          </ControlButton>
        )}
        <ControlButton label="Next photo" onClick={() => nudge(1)}>
          <ChevronRight aria-hidden="true" className="size-5" />
        </ControlButton>
      </div>
    </section>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="border-line text-ink hover:bg-surface-alt flex size-10 cursor-pointer items-center justify-center rounded-full border transition-colors"
    >
      {children}
    </button>
  );
}
