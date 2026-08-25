/**
 * Habit-wheel geometry, ported from the Habi Sloth app.
 *
 * Two Dart sources, both of which are the authority here:
 *
 * - `sil006/lib/utils/wheel_geometry.dart` — how a circle is divided into
 *   slices and how a drag snaps to one. Ported nearly line-for-line.
 * - `sil006/lib/widgets/wheel/wheel_button_painters.dart` — how one habit
 *   button's outer ring is drawn: N sections with gaps between them, a grey
 *   base track under all of them, and a fill that laps and darkens.
 *
 * The Dart painters draw straight onto a `Canvas`; this port returns plain arc
 * descriptions instead, so the React component can turn them into SVG and the
 * maths stays testable without a renderer. {@link arcPath} is the only piece
 * with no Dart counterpart — Flutter's `drawArc` takes a rect and two angles,
 * where SVG needs an explicit path.
 *
 * Three Dart/JS differences bite in this file and are handled explicitly:
 *
 * - **`%` on negatives.** Dart's `%` always returns a non-negative result for a
 *   positive divisor; JavaScript's keeps the sign of the dividend. A rotation
 *   left of the rest angle is negative, so this matters in practice — see
 *   {@link WheelGeometry.segmentForAngle}.
 * - **`.round()` at a half.** Dart rounds half *away from zero*, so
 *   `(-2.5).round()` is `-3`. `Math.round(-2.5)` is `-2`. See
 *   {@link roundHalfAwayFromZero}.
 * - **Screen-space angle direction.** SVG's y axis points down, so increasing
 *   angles sweep clockwise — which is what the app does, and why every arc
 *   below uses SVG's positive sweep flag.
 */

import { MAX_SUGGESTED_DAILY_COUNT } from "@/lib/habits";

const TAU = Math.PI * 2;

/**
 * Twelve o'clock, where every ring starts.
 *
 * Flutter's `drawArc` measures from three o'clock, so the Dart painters all
 * open with `-pi / 2` to get to the top. Same convention, named once.
 */
const ARC_START = -Math.PI / 2;

/** Gap between ring sections, in radians (~4°). `gapAngle` in the painters. */
export const RING_GAP_ANGLE = 0.07;

/**
 * The fewest slices the wheel is ever divided into: a near-empty wheel keeps
 * slim slices rather than fanning three habits across the whole circle.
 */
export const MIN_WHEEL_SEGMENTS = 10;

/**
 * Dart's `num.round()` — half rounds away from zero, where `Math.round` rounds
 * half towards positive infinity.
 *
 * Only the exact-half case differs, but the wheel hits it: a drag released
 * precisely between two slices at a negative angle would snap the wrong way.
 */
export function roundHalfAwayFromZero(value: number): number {
  return value < 0 ? -Math.round(-value) : Math.round(value);
}

/**
 * The slices needed to lay out `habitCount` habits — one each, plus one for the
 * edit button — floored at {@link MIN_WHEEL_SEGMENTS}.
 *
 * The wheel fills those slices as habits at `0..habitCount - 1`, placeholders
 * at `habitCount..totalSegments - 2` and the edit button in the last one, so
 * the `+ 1` is what keeps the placeholder count from going negative.
 */
export function wheelSegmentsFor(habitCount: number): number {
  return Math.max(habitCount + 1, MIN_WHEEL_SEGMENTS);
}

/**
 * The rotation maths for a radial selector: a circle divided into
 * `totalSegments` equal slices, spun by a drag and snapped to the nearest slice
 * on release.
 */
export class WheelGeometry {
  /** Number of slices the circle is divided into. */
  readonly totalSegments: number;
  /** Angular width of one slice, in radians. */
  readonly segmentAngle: number;
  /** Rotation nudge that centres a segment at the top of the wheel. */
  readonly segmentOffset: number;

  constructor({ totalSegments }: { totalSegments: number }) {
    if (!Number.isInteger(totalSegments) || totalSegments <= 0) {
      throw new Error(
        `a wheel needs at least one segment, got ${totalSegments}`,
      );
    }
    this.totalSegments = totalSegments;
    this.segmentAngle = TAU / totalSegments;
    // Only totalSegments % 4 matters: a multiple of four already has a segment
    // boundary on each axis, so it needs no nudge.
    this.segmentOffset = (TAU / totalSegments) * ((totalSegments % 4) / 4);
  }

  /** The rotation the wheel opens at: the first segment parked at the top. */
  get restAngle(): number {
    return (
      -Math.floor(this.totalSegments / 4) * this.segmentAngle -
      this.segmentOffset
    );
  }

  /**
   * The segment index `angle` currently points at, wrapped into
   * `0..totalSegments - 1`.
   *
   * The double `%` is Dart's `%` written out: a rotation left of the rest angle
   * is negative, and Dart would already have returned a non-negative index
   * where JavaScript returns a negative one. It also normalises `-0`, which the
   * single-`%` form lets through and which `Object.is` treats as a distinct
   * value from the `0` every caller expects.
   */
  segmentForAngle(angle: number): number {
    const segment = roundHalfAwayFromZero(
      (angle + this.segmentOffset) / this.segmentAngle,
    );
    return (
      ((segment % this.totalSegments) + this.totalSegments) % this.totalSegments
    );
  }

  /**
   * The rotation to animate to when a drag ends at `angle`: the centre of the
   * nearest segment.
   *
   * Deliberately *not* wrapped by `totalSegments` — the snap animates from the
   * current angle to this one, so the unwrapped target keeps the wheel turning
   * the short way instead of unwinding a full revolution.
   */
  snapTargetFor(angle: number): number {
    const segment = roundHalfAwayFromZero(
      (angle + this.segmentOffset) / this.segmentAngle,
    );
    return segment * this.segmentAngle - this.segmentOffset;
  }

  /** The rotation that parks `segment` at the top of the wheel. */
  angleForSegment(segment: number): number {
    return segment * this.segmentAngle - this.segmentOffset;
  }
}

// ── Button ring geometry ─────────────────────────────────────────────────────

/** One arc of a habit button's outer ring. */
export interface RingArc {
  /** Start angle in radians, measured from three o'clock, sweeping clockwise. */
  start: number;
  /** Angular width in radians. */
  sweep: number;
}

/** A filled arc, tagged with the lap it belongs to so it can be shaded. */
export interface RingFill extends RingArc {
  /** Completed laps before this arc: 0 is the first time round. */
  lap: number;
}

/**
 * Sections the ring is divided into — the Suggested Daily Count, clamped to the
 * same ceiling the app clamps it to.
 */
export function ringSectionCount(suggestedDailyCount: number): number {
  return Math.min(
    Math.max(Math.trunc(suggestedDailyCount), 1),
    MAX_SUGGESTED_DAILY_COUNT,
  );
}

/** Angular width of one section, once the gaps are taken out of the circle. */
function sectionSweepFor(sections: number): number {
  return sections > 1 ? (TAU - sections * RING_GAP_ANGLE) / sections : TAU;
}

/**
 * The grey base track: one arc per section, visible under everything and the
 * only thing showing at a count of zero.
 */
export function ringTrack(sections: number): RingArc[] {
  const n = ringSectionCount(sections);
  const sweep = sectionSweepFor(n);
  return Array.from({ length: n }, (_, i) => ({
    start: ARC_START + i * (sweep + RING_GAP_ANGLE),
    sweep,
  }));
}

/**
 * The dividers between sections.
 *
 * The Dart paints these in `Colors.white` because the wheel it sits on is
 * white. Here the wheel face is a token that moves with the theme, so the
 * caller must paint these in the face colour rather than in white — otherwise
 * the dividers glow in dark mode.
 *
 * Always drawn, at every count including zero.
 */
export function ringDividers(sections: number): RingArc[] {
  const n = ringSectionCount(sections);
  const sweep = sectionSweepFor(n);
  return Array.from({ length: n }, (_, i) => ({
    start: ARC_START + (i + 1) * sweep + i * RING_GAP_ANGLE,
    sweep: RING_GAP_ANGLE,
  }));
}

/**
 * How dark a completed lap paints. The Dart indexes `[600, 800, 900, 900]`, so
 * everything from the fourth lap on is identical.
 */
export const MAX_LAP_SHADE = 3;

/** The shade step for a lap, clamped exactly as the Dart's `_shadeForLap` is. */
export function lapShadeIndex(lap: number): number {
  return Math.min(Math.max(lap, 0), MAX_LAP_SHADE);
}

export interface RingFillsParams {
  /**
   * `count / suggestedDailyCount`. Values ≥ 1 are completed laps — 1.33 is one
   * full lap plus a third of the next.
   */
  arcValue: number;
  /** Sections to divide the ring into, before clamping. */
  sections: number;
}

/**
 * The filled arcs of one button's ring, in paint order.
 *
 * Completed laps come first as full rings, then the partial lap is spread
 * across sections left to right — a section either fills completely or is the
 * one the budget runs out in.
 *
 * Laps past {@link MAX_LAP_SHADE} are not emitted: their shade is clamped, so
 * they would repaint the previous lap in exactly the same colour. The Dart
 * draws them because a `Canvas` is cheap to overdraw; a DOM node is not, and
 * the rendered result is identical.
 */
export function ringFills({ arcValue, sections }: RingFillsParams): RingFill[] {
  const n = ringSectionCount(sections);
  const sweep = sectionSweepFor(n);
  const fills: RingFill[] = [];

  if (arcValue <= 0) return fills;

  const completedLaps = Math.floor(arcValue);
  const fractional = arcValue - completedLaps;

  const paintedLaps = Math.min(completedLaps, MAX_LAP_SHADE + 1);
  for (let lap = 0; lap < paintedLaps; lap++) {
    for (let i = 0; i < n; i++) {
      fills.push({
        start: ARC_START + i * (sweep + RING_GAP_ANGLE),
        sweep,
        lap,
      });
    }
  }

  if (fractional > 0) {
    // The partial lap gets `fractional` of the ring, measured in sections.
    const budget = fractional * n;
    for (let i = 0; i < n; i++) {
      if (budget <= i) break;
      fills.push({
        start: ARC_START + i * (sweep + RING_GAP_ANGLE),
        sweep: budget >= i + 1 ? sweep : (budget - i) * sweep,
        lap: completedLaps,
      });
      if (budget < i + 1) break;
    }
  }

  return fills;
}

// ── SVG helpers ──────────────────────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

/**
 * Rounds a coordinate on its way into the DOM.
 *
 * `Math.sin` and `Math.cos` are explicitly **not** required to be correctly
 * rounded — the spec lets each implementation pick its own approximation. Node
 * and the browser can therefore disagree in the last bit, which on a
 * prerendered page surfaces as a React hydration mismatch: the server writes
 * `-5.145795196975595` and the browser computes `-5.145795196975593`, React
 * sees different attributes and gives up on patching that subtree.
 *
 * Three decimals is a thousandth of a user unit in a 1000-unit viewBox — orders
 * of magnitude below a device pixel — and is identical on both engines.
 *
 * Every number this module serialises into markup goes through here.
 */
export function svgNumber(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** A point on a circle. Angles sweep clockwise, because SVG's y axis is down. */
export function pointOnCircle(
  centre: Point,
  radius: number,
  angle: number,
): Point {
  return {
    x: centre.x + radius * Math.cos(angle),
    y: centre.y + radius * Math.sin(angle),
  };
}

export interface ArcPathParams {
  centre: Point;
  radius: number;
  start: number;
  sweep: number;
}

/**
 * An SVG path for one arc, as a stroked open curve.
 *
 * A single `A` command cannot express a full circle — start and end coincide,
 * and the renderer draws nothing — so a sweep of a full turn or more is split
 * into two halves. `ringFills` emits exactly that for a single-section ring.
 */
export function arcPath({
  centre,
  radius,
  start,
  sweep,
}: ArcPathParams): string {
  const r = svgNumber(radius);

  if (sweep >= TAU) {
    const top = pointOnCircle(centre, radius, start);
    const bottom = pointOnCircle(centre, radius, start + Math.PI);
    return [
      `M ${svgNumber(top.x)} ${svgNumber(top.y)}`,
      `A ${r} ${r} 0 1 1 ${svgNumber(bottom.x)} ${svgNumber(bottom.y)}`,
      `A ${r} ${r} 0 1 1 ${svgNumber(top.x)} ${svgNumber(top.y)}`,
    ].join(" ");
  }

  const from = pointOnCircle(centre, radius, start);
  const to = pointOnCircle(centre, radius, start + sweep);
  const largeArc = sweep > Math.PI ? 1 : 0;
  // Sweep flag 1 is clockwise in SVG's y-down space, matching the app.
  return `M ${svgNumber(from.x)} ${svgNumber(from.y)} A ${r} ${r} 0 ${largeArc} 1 ${svgNumber(to.x)} ${svgNumber(to.y)}`;
}
