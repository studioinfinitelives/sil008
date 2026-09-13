import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EvlPhotoCarousel } from "@/app/teamevl/_components/EvlPhotoCarousel";
import { evlPhotos } from "@/app/teamevl/_components/evlPhotos";

/**
 * The carousel's contract: six cards whatever the photo count, every photo
 * coming round in order, exactly one exposed at a time, manual steps both ways,
 * and autoplay of four beats then a fast-forward that lands where it began.
 *
 * The queue is the interesting part. More photographs than cards means a card
 * must change what it shows, and the only acceptable place is the back of the
 * ring. Asserted directly: one step, exactly one card changed, half a turn away.
 *
 * `inert` rather than absence marks "not the front card" — all six cards are
 * always in the DOM. Counts come from `evlPhotos`, so adding a photograph is
 * not a test edit. The `transform` string is deliberately not asserted; pinning
 * the geometry would make every restyle a test edit.
 *
 * USE `fireEvent`, NOT `userEvent`. This file drives the clock, and `userEvent`
 * deadlocks against Vitest's fake timers whatever `advanceTimers` or `delay` it
 * is given: the click never resolves and the test times out.
 * `EvlLinkDrawer.test.tsx` keeps `userEvent` because it fakes no timers.
 */

const BEAT_MS = 1000;

/** Cards on the ring, and photographs in the queue behind it. */
const SLOTS = 6;
const COUNT = evlPhotos.length;

/** Mirrored from the component; these numbers are its contract. */
const FAST_MS = (COUNT / 10) * 1000;
const SETTLE_MS = 80;

/** What the announced count reads after `step` moves from a standing start. */
const position = (step: number) => `${(step % COUNT) + 1} of ${COUNT}`;

const figures = () => [...document.querySelectorAll("figure")];
const alts = () =>
  figures().map((figure) => figure.querySelector("img")?.getAttribute("alt"));
const front = () => figures().filter((figure) => !figure.hasAttribute("inert"));
const frontAlt = () => front()[0]?.querySelector("img")?.getAttribute("alt");
const frontSlot = () =>
  figures().findIndex((figure) => !figure.hasAttribute("inert"));
const readout = () => screen.getByText(new RegExp(`of ${COUNT}$`));
const button = (name: RegExp) => screen.getByRole("button", { name });

/** The ring's parent, where the pointer and click handlers sit. */
const stage = () => figures()[0]?.parentElement?.parentElement;

function beats(count: number) {
  for (let index = 0; index < count; index += 1) {
    advance(BEAT_MS);
  }
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("EvlPhotoCarousel", () => {
  it("puts six cards on the ring, whatever the queue behind it holds", () => {
    render(<EvlPhotoCarousel />);

    expect(figures()).toHaveLength(SLOTS);
    for (const alt of alts()) expect(alt).not.toBe("");
  });

  it("exposes only the card facing the reader, starting on the first", () => {
    render(<EvlPhotoCarousel />);

    expect(front()).toHaveLength(1);
    expect(frontAlt()).toBe(evlPhotos[0]?.alt);
    expect(readout()).toHaveTextContent(`1 of ${COUNT}`);
  });

  it("brings every photograph round in order, and starts over", () => {
    render(<EvlPhotoCarousel />);

    const seen = [frontAlt()];
    for (let index = 1; index < COUNT; index += 1) {
      fireEvent.click(button(/next photo/i));
      seen.push(frontAlt());
    }
    expect(seen).toEqual(evlPhotos.map((photo) => photo.alt));

    fireEvent.click(button(/next photo/i));
    expect(frontAlt()).toBe(evlPhotos[0]?.alt);
    expect(readout()).toHaveTextContent(`1 of ${COUNT}`);
  });

  it("changes a card's photograph only where the ring hides it", () => {
    render(<EvlPhotoCarousel />);

    const before = alts();
    // Half a turn from the front is the most occluded slot, the only place a
    // swap belongs.
    const hidden = (frontSlot() + SLOTS / 2) % SLOTS;

    fireEvent.click(button(/next photo/i));

    const moved = alts()
      .map((alt, slot) => (alt === before[slot] ? null : slot))
      .filter((slot) => slot !== null);
    expect(moved).toEqual([hidden]);
  });

  it("steps back from the first photo onto the last", () => {
    render(<EvlPhotoCarousel />);

    fireEvent.click(button(/previous photo/i));

    expect(readout()).toHaveTextContent(`${COUNT} of ${COUNT}`);
    expect(frontAlt()).toBe(evlPhotos.at(-1)?.alt);
  });

  it("autoplays four single steps, then winds on fast, then carries on", () => {
    render(<EvlPhotoCarousel />);

    beats(1);
    expect(readout()).toHaveTextContent(position(1));
    beats(3);
    expect(readout()).toHaveTextContent(position(4));

    // The sweep runs the length of the queue, so it returns to the photograph
    // it left on: the fifth beat does not change the front.
    beats(1);
    expect(readout()).toHaveTextContent(position(4));
    expect(frontAlt()).toBe(evlPhotos[4]?.alt);

    advance(FAST_MS + SETTLE_MS);
    expect(readout()).toHaveTextContent(position(5));
  });

  it("stops on the pause button and says which way it will go next", () => {
    render(<EvlPhotoCarousel />);

    fireEvent.click(button(/pause the carousel/i));
    beats(3);
    expect(readout()).toHaveTextContent(`1 of ${COUNT}`);

    fireEvent.click(button(/play the carousel/i));
    beats(1);
    expect(readout()).toHaveTextContent(`2 of ${COUNT}`);
  });

  it("holds still under the pointer and resumes when it leaves", () => {
    render(<EvlPhotoCarousel />);
    const element = stage();
    expect(element).not.toBeUndefined();

    fireEvent.pointerEnter(element!);
    beats(3);
    expect(readout()).toHaveTextContent(`1 of ${COUNT}`);

    fireEvent.pointerLeave(element!);
    beats(1);
    expect(readout()).toHaveTextContent(`2 of ${COUNT}`);
  });

  it("holds on a click on the photographs, and lets go on the next", () => {
    render(<EvlPhotoCarousel />);
    const element = stage();

    fireEvent.click(element!);
    beats(3);
    expect(readout()).toHaveTextContent(`1 of ${COUNT}`);

    fireEvent.click(element!);
    beats(1);
    expect(readout()).toHaveTextContent(`2 of ${COUNT}`);
  });

  it("announces the count only while it is standing still", () => {
    render(<EvlPhotoCarousel />);

    expect(readout()).toHaveAttribute("aria-live", "off");

    fireEvent.click(button(/pause the carousel/i));
    expect(readout()).toHaveAttribute("aria-live", "polite");
  });
});
