"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { evlPhotos } from "@/app/teamevl/_components/evlPhotos";

/**
 * A turntable of photographs from real games of Team EvL.
 *
 * The photos are spaced evenly around a cylinder and the whole ring turns about
 * a **vertical axis**: one card faces the reader square on, the two beside it
 * lean away, and the far side of the ring is visible between them. It spins in
 * place, so it holds one column of a `FeatureRow` the way a single illustration
 * does on every other row of the page.
 *
 * Every photo is cropped to the same upright 3:4 window — some were shot
 * landscape and lose width to it — because a ring of mixed shapes has no ring
 * in it, just rectangles at different distances.
 *
 * **Six cards, any number of photographs.** The ring is six slots and the rest
 * of `evlPhotos` is a queue: a card takes on the next photograph the moment it
 * reaches the back of the ring, and drops the one it was carrying at the same
 * instant. That position is directly behind the card facing the reader, at the
 * smallest scale the perspective draws, so the change happens out of sight and
 * the ring never appears to repeat itself. The order of the list is the order
 * they arrive in, and adding a photograph to it is the whole job.
 *
 * **The cards do not touch, and they are not opaque.** A gap of `--deck-gap`
 * between neighbours, plus a little transparency on every card, is what makes
 * the thing read as a cylinder rather than a drum with a skin on it: the far
 * side of the ring shows through the gaps and faintly through the cards
 * themselves, and because the cards keep their backs (no
 * `backface-visibility: hidden`) those far photos are seen from behind,
 * mirrored, exactly as they would be through glass.
 *
 * **The geometry is a constant, not a measurement.** For `N` cards of width `W`
 * separated by `G` the ring's radius is `(W + G) / 2 / tan(180° / N)`; with six
 * cards that is `(W + G) × 0.866`. So two CSS variables drive the whole thing
 * and nothing here needs a `ResizeObserver`.
 *
 * **`overflow: hidden` goes on the stage, never on the ring.** An element with
 * `overflow` other than `visible` has its own `transform-style` forced to
 * `flat`; the stage does not carry `preserve-3d` so clipping there is safe, and
 * clipping on the ring would collapse the carousel into a pile of stacked
 * rectangles. (The same forcing on each card is harmless — a card's only child
 * is a flat image.)
 */

/**
 * Cards on the ring at once. A fact about the geometry, not about the
 * collection: `--deck-r`'s 0.866 is `1 / (2 × tan(180° / 6))` and goes with it,
 * and so does `SEAM` below.
 */
const SLOTS = 6;

/** Photographs in the queue. */
const COUNT = evlPhotos.length;

/** Degrees between neighbours around the ring. */
const SEG = 360 / SLOTS;

/**
 * How far ahead of the front card a slot carries the photograph that is coming,
 * rather than the one that has been. Slots 0–2 are the front card and the two
 * arriving; 3–5 are the three that have gone. So the seam — the one place on
 * the ring where a card changes what it is showing — falls between slots 3 and
 * 2, and a slot crosses it at the instant the ring is still drawn at the angle
 * that put it at the back. Any other value swaps a photograph in plain sight.
 */
const SEAM = 2;

/** How often the ring moves on by itself. */
const BEAT_MS = 1000;

/** Single steps taken before the ring winds on fast. */
const STEPS_PER_CYCLE = 4;

/**
 * The fast-forward: **one pass through the whole collection**, at ten photos a
 * second — ten times the ordinary pace.
 *
 * Going round by exactly the length of the queue is what brings it back to the
 * photograph it left on, which is the point of it: it riffles the set in front
 * of the reader and hands them back where they were. The ring itself does not
 * land on a whole number of turns, and does not need to — one slot is
 * indistinguishable from another.
 *
 * Its length follows from the same rule, so a collection this size takes the
 * second it is meant to and a longer one takes proportionally longer rather
 * than going faster.
 *
 * It is **one** transition of ten segments, not ten of one. Back-to-back 100 ms
 * tweens would stutter — each one eases, and each one is a fresh style commit
 * the compositor has to pick up — whereas a single sweep is handed over once
 * and interpolated there.
 */
const FAST_STEPS = COUNT;
/** Photos a second during the burst. */
const FAST_RATE = 10;
const FAST_MS = (FAST_STEPS / FAST_RATE) * 1000;

/**
 * A breath after the sweep before the slow beats start again. Without it the
 * next step is scheduled for the exact millisecond the sweep lands, and a timer
 * that fires a frame early interrupts a transform mid-flight — which is the
 * hitch you see at the end of the fast-forward, not the fast-forward itself.
 */
const SETTLE_MS = 80;

/** How long a move sweeps for — a shade under the beat, so it settles first. */
const STEP_MS = 600;
const MANUAL_MS = 500;

/**
 * Eased for a single photo. The fast-forward gets a symmetrical ease so it
 * winds up from rest and winds down to rest: linear would average the same ten
 * photos a second but slam from nothing to full speed and back, and it is that
 * jolt at either end that reads as a stutter.
 */
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const SWEEP = "cubic-bezier(0.45, 0, 0.55, 1)";

/**
 * The two things outside React that decide whether the ring may move: the
 * reader's motion preference and whether this tab is even on screen.
 *
 * `useSyncExternalStore` rather than an effect that seeds state, because that is
 * what these are — external stores React has to subscribe to. Reading them in an
 * effect and calling `setState` renders twice on mount and trips the
 * `react-hooks/set-state-in-effect` rule for exactly that reason.
 *
 * The third argument to each is the server snapshot. This is a static export, so
 * the HTML is written long before anyone's preferences are known: it says
 * "no preference, tab visible", which is the same thing a browser with no
 * `matchMedia` gets, and the subscription corrects it on the first client
 * render.
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
   * Angle, sweep length and easing as one value, because all three have to
   * change on the same commit — set them apart and the fast-forward either
   * inherits the single step's easing or overwrites it a frame late.
   *
   * `step` counts up forever and is **never taken modulo**. It is the number of
   * photographs that have gone by, which is what both the ring's angle and the
   * queue's position are read off; wrap it and the fast-forward becomes a
   * no-op and every crossing of the last photo snaps back.
   */
  const [spin, setSpin] = useState({ step: 0, ms: 0, ease: EASE });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  /** Where we are in the four-steps-then-a-fast-forward cycle. */
  const beat = useRef(0);

  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  // A backgrounded tab should not be turning a ring of photographs; without this
  // the chain keeps firing and the reader comes back to one that has raced on.
  const visible = useSyncExternalStore(
    subscribeVisibility,
    readVisibility,
    () => true,
  );

  /** Which photograph is facing the reader — the queue's position, not a slot. */
  const front = ((spin.step % COUNT) + COUNT) % COUNT;
  const running = !paused && !hovered && !reduced && visible;

  /**
   * The autoplay: four photos, one a second, then a fast-forward of two whole
   * turns that comes back to the photograph it left on, then the next four —
   * round and round until something stops it.
   *
   * A `setTimeout` chain rather than `setInterval`, because the fast-forward is
   * not the same move as a step even though both take a second, and because a
   * chain restarts cleanly from a pause instead of firing whatever it owed the
   * moment the reader lets go. The burst schedules the next tick at its own
   * length, so the first slow step after it starts as the ring settles.
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
   * One photo by hand. Resetting the beat is the point: land mid-cycle and the
   * fast-forward a moment later runs away with the step the reader just asked
   * for.
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
      `data-analytics="off"` over the whole carousel, not just the stage. The
      delegated click tracker describes every button on the site, and a reader
      stepping through photographs would otherwise fill the reports with
      `button_click / Next photo` — chrome for driving one row, not a signal
      about anything. Narrowing it to the stage alone is a one-word change if
      the arrow presses ever turn out to be worth counting.

      The width variables live here so one number sets the card, the ring radius
      and the stage height together. `--deck-r` and `--deck-h` are substituted
      against whichever `--deck-w` the breakpoints leave winning on this same
      element, so the three cannot drift apart. `--deck-gap` is the white space
      between neighbouring cards, and it widens the ring rather than narrowing
      the photographs.
    */
    <section
      aria-roledescription="carousel"
      aria-label="Photos from real games of Team EvL"
      data-analytics="off"
      className="mx-auto flex w-full flex-col items-center gap-5 [--deck-gap:3.5rem] [--deck-h:calc(var(--deck-w)*4/3)] [--deck-r:calc((var(--deck-w)+var(--deck-gap))*0.866)] [--deck-w:190px] sm:[--deck-w:230px] lg:[--deck-w:260px]"
    >
      {/*
        The stage. It owns the perspective and the clip, and it is what the
        pointer talks to: moving over it holds the ring still, clicking it holds
        the ring still until clicked again. Neither is reachable from a keyboard,
        which is exactly why the pause button below is not optional.
      */}
      <div
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => setPaused((held) => !held)}
        // A short perspective — roughly two and a half card widths from the
        // reader's eye to the front of the ring. The shorter it is the harder
        // the far side falls away: at this distance the back of the cylinder
        // draws at a little over half the size of the photo facing you, which
        // is what gives the ring its depth.
        style={{ perspective: "700px" }}
        className="relative h-[calc(var(--deck-h)+3rem)] w-full cursor-pointer overflow-hidden"
      >
        {/*
          The ring. The negative `translateZ` pulls it back by exactly the radius
          each card is pushed out by, so the front card lands on the perspective
          plane and renders at its natural size rather than enlarged.
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
              Where this slot is standing relative to the card facing the
              reader, and therefore which photograph it is carrying: the ones
              ahead of the front hold what is coming, the ones behind it hold
              what has just gone, and the jump between the two happens at the
              back of the ring.

              Keyed by the slot rather than by the photograph on purpose. A slot
              is a fixed place in the ring that changes its contents; keying by
              `photo.src` would have React tear the card out and build a new one
              at the seam, and the browser would drop the layer mid-turn.
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
                // Only the card facing the reader is reachable. The rest are
                // the same row's content over again as far as a screen reader
                // or the tab order is concerned, and half of them are facing
                // away — the same device the closed link drawer uses.
                inert={!isFront}
                aria-hidden={isFront ? undefined : true}
                style={{
                  transform: `translate(-50%, -50%) rotateY(${slot * SEG}deg) translateZ(var(--deck-r))`,
                  // `backface-visibility` is left alone on purpose. The cards
                  // on the far side of the ring are seen through the gaps
                  // between the near ones, from behind and so mirrored, which
                  // is what makes the shape read as a cylinder you can see
                  // into rather than a solid drum.
                }}
                // `opacity-95`: barely off solid — just enough for the ring
                // behind to ghost through a card, with the photograph in front
                // of you still reading as a photograph. It goes on the figure
                // so the card's own background goes with it; fading only the
                // image would leave a solid panel behind it.
                className="bg-surface-alt absolute top-1/2 left-1/2 h-[var(--deck-h)] w-[var(--deck-w)] overflow-hidden rounded-2xl opacity-95 shadow-[0_12px_30px_-10px_rgb(0_0_0/0.45)]"
              >
                {/*
                  No `sizes`: `next/image` is unoptimized site-wide, so there is
                  no `srcset` for it to choose from and the attribute would only
                  suggest a responsiveness that is not there.
                */}
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
          The count is not drawn — the controls are the whole of the visible
          chrome — but it is still announced, because "photo 3 of 6" is the one
          thing a reader stepping through with the arrows cannot get from the
          alt text of the card that just arrived. Live only while the ring is
          standing still: a region that speaks every second while it autoplays
          is unusable.
        */}
        <p aria-live={running ? "off" : "polite"} className="sr-only">
          {front + 1} of {COUNT}
        </p>
        {/*
          WCAG 2.2.2: this moves by itself, for longer than five seconds, beside
          text. Hover and click on the stage stop it for a mouse and for nobody
          else, so a real control is required rather than nice to have. It is
          dropped only when nothing is moving in the first place.
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
