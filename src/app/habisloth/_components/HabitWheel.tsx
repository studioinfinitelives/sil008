import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import { useId } from "react";
import { wheelBackgroundUrl } from "@/lib/cdn";
import {
  arcPath,
  lapShadeIndex,
  pointOnCircle,
  ringDividers,
  ringFills,
  ringTrack,
  svgNumber,
  WheelGeometry,
  wheelSegmentsFor,
} from "@/lib/wheel";

/**
 * An SVG recreation of Habi Sloth's habit wheel.
 *
 * Every proportion here comes from `sil006/lib/widgets/wheel/wheel_button.dart`
 * and the geometry in `@/lib/wheel`, so this is the app's wheel rather than a
 * drawing of it: the ring really is the day's count against the Suggested Daily
 * Count, and the inner fill really is the week's pace.
 *
 * **No `"use client"`, deliberately.** This component takes `onSelect` and
 * `onIncrement` — functions, which a Server Component cannot serialise across
 * the boundary — so it is only ever reachable from a Client Component, and
 * `HabitPaceDemo` is the one that declares the boundary. Marking it here as
 * well would suggest it is a second entry point into client-land when it is
 * not.
 *
 * **The wheel does not follow the site's theme.** It is a picture of the app,
 * and the app draws this screen on a light face whichever theme the phone is
 * in. Inverting it in dark mode would show visitors something the product never
 * shows them, so the face and its ink are fixed values rather than tokens. The
 * art behind it is the app's own default background.
 */

// ── Proportions ──────────────────────────────────────────────────────────────

/**
 * The wheel's diameter in user units. Everything else derives from it, exactly
 * as `wheelSize` does in the Dart, so the whole thing scales with the viewBox.
 */
const WHEEL_SIZE = 1000;

const CENTRE = { x: WHEEL_SIZE / 2, y: WHEEL_SIZE / 2 };

/**
 * How much of the disc the viewBox shows.
 *
 * The app's wheel runs off the bottom of the phone screen, so the user sees a
 * dome rather than a circle, with the buttons arced across the top. Cropping to
 * 62% of the diameter reproduces that framing.
 */
const VIEWBOX_HEIGHT = WHEEL_SIZE * 0.62;

/**
 * The frame is wider than the wheel so the backdrop shows either side of it.
 * Without the margin the disc spans the full width and reads as a rounded
 * rectangle rather than the dome the app actually shows.
 */
const VIEW_X = -WHEEL_SIZE * 0.11;
const VIEW_WIDTH = WHEEL_SIZE * 1.22;

/**
 * Distance from the wheel centre to a button, pulled a little inward from the
 * rim so buttons are not crowded against the edge. `offsetMultiplier` in the
 * Dart.
 */
const BUTTON_RADIUS = WHEEL_SIZE / 2.75;

/** `iconSize` in the Dart — the unit all button chrome is expressed in. */
const ICON_SIZE = WHEEL_SIZE / 7 / 2.5;

/** Outer-ring padding around the icon. */
const RING_GAP = ICON_SIZE * 0.7;

/** The square box every ring and fill layer is sized to, so they stay concentric. */
const RING_BOX = ICON_SIZE * 2 + RING_GAP;

/**
 * The Dart holds three lengths in fixed logical pixels rather than scaling them
 * with the wheel: the ring stroke (2.5, painted at +2), and the inner fill's
 * inset from the ring box (10). This viewBox is far larger than a phone's
 * wheel, so those constants are scaled by the ratio between the two — which
 * preserves the *look* rather than the number, and is the thing being ported.
 */
const PHONE_WHEEL_SIZE = 350;
const SCALE = WHEEL_SIZE / PHONE_WHEEL_SIZE;

/** Painted ring thickness: the Dart's `segWidth`, i.e. strokeWidth + 2. */
const RING_STROKE = (2.5 + 2) * SCALE;

/** Dart: `radius = (shortestSide - strokeWidth) / 2`, on the unpadded stroke. */
const RING_RADIUS = (RING_BOX - 2.5 * SCALE) / 2;

/** The fill sits inside the ring with a small gap between the two. */
const INNER_FILL_RADIUS = (RING_BOX - 10 * SCALE) / 2;

const LABEL_GAP = ICON_SIZE * 0.28;
const LABEL_FONT_SIZE = ICON_SIZE * 0.55;

/** Where a label sits, measured out from its button's centre. */
const LABEL_RADIUS = RING_BOX / 2 + LABEL_GAP + LABEL_FONT_SIZE;

// ── Fixed palette ────────────────────────────────────────────────────────────

/** The wheel face. White in the app, and white here for the same reason. */
const FACE = "#ffffff";

/** `Colors.grey.shade100` — the base track under every ring section. */
const TRACK = "#f5f5f5";

/** Habi Sloth's `onPrimary`, the app's ink on a light face. */
const INK = "#6a412d";

const PLACEHOLDER = "#dcd6cf";

/**
 * Flat stand-in for the backdrop art, sampled from it. Drawn underneath rather
 * than instead of the image, so a slow or failed CDN fetch degrades to the same
 * composition rather than to a hole.
 */
const BACKDROP = "#c9e7cb";

/**
 * Which of the app's recoloured backdrops to show. Sage is the green the
 * product's own screenshots use, and BACKDROP above is sampled from it — change
 * one and the other must follow.
 */
const BACKDROP_COLOR = "sage" as const;

/**
 * How far a completed lap darkens. The Dart walks Material shades
 * `[600, 800, 900, 900]`; mixing towards black in oklab is the closest
 * equivalent for arbitrary brand colours, which have no shade ramp.
 */
const LAP_DARKEN: readonly number[] = [0, 22, 38, 38];

function lapStroke(color: string, lap: number): string {
  // `lapShadeIndex` clamps into range, so the lookup always hits — but under
  // `noUncheckedIndexedAccess` it is still `number | undefined`, and falling
  // back to "no darkening" is the right answer if it ever missed.
  const darken = LAP_DARKEN[lapShadeIndex(lap)] ?? 0;
  return darken === 0
    ? color
    : `color-mix(in oklab, ${color} ${100 - darken}%, black)`;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface WheelHabit {
  id: string;
  name: string;
  icon: LucideIcon;
  /** Any CSS colour; the lap shades are mixed from it. */
  color: string;
  /** Times ticked off today. */
  todayCount: number;
  /** The ring's section count — `computeStaticDailyCount` for this habit. */
  suggestedDailyCount: number;
  /** `computeInnerFillFraction` for this habit, 0–1. */
  innerFill: number;
}

interface HabitWheelProps {
  habits: readonly WheelHabit[];
  /** The habit parked at the top of the wheel. */
  selectedId: string;
  onSelect: (id: string) => void;
  onIncrement: (id: string) => void;
}

export function HabitWheel({
  habits,
  selectedId,
  onSelect,
  onIncrement,
}: HabitWheelProps) {
  // Ids must be unique per instance: two wheels on one page would otherwise
  // share clip paths, and the second would clip against the first's geometry.
  const idPrefix = useId();

  const totalSegments = wheelSegmentsFor(habits.length);
  const geometry = new WheelGeometry({ totalSegments });

  const selectedIndex = Math.max(
    habits.findIndex((habit) => habit.id === selectedId),
    0,
  );

  /**
   * Where a segment sits before the wheel is turned.
   *
   * `restAngle` is twelve o'clock, and holds for every segment count.
   */
  function angleForSegment(segment: number): number {
    return geometry.restAngle + segment * geometry.segmentAngle;
  }

  /**
   * How far the wheel is turned, so the selected habit is parked at the top.
   *
   * Applied once to the whole group rather than folded into each button's
   * angle, so the browser can tween one transform and the wheel spins to its
   * new position the way the app's does — instead of every button jumping.
   * `prefers-reduced-motion` kills the tween in `globals.css`.
   */
  const segmentAngleDeg = (geometry.segmentAngle * 180) / Math.PI;
  const rotationDeg = svgNumber(-selectedIndex * segmentAngleDeg);

  // Habits first, then placeholders, then the add button in the last slice —
  // the layout `wheelSegmentsFor` reserves room for.
  const placeholderCount = totalSegments - habits.length - 1;

  return (
    <svg
      viewBox={`${VIEW_X} 0 ${VIEW_WIDTH} ${VIEWBOX_HEIGHT}`}
      className="h-auto w-full"
      role="group"
      aria-label="Habit wheel"
    >
      {/* The app's own wheel backdrop, from the same CDN the app loads it from.
          Painted flat first so the composition survives a failed image — the
          wheel must still read as a white dome on green, not on nothing. An
          SVG root clips to its viewport, so `slice` cannot bleed out. */}
      <rect
        x={VIEW_X}
        width={VIEW_WIDTH}
        height={VIEWBOX_HEIGHT}
        fill={BACKDROP}
      />
      {/* An SVG <image>, not an <img>: next/image renders an HTML element and
          cannot appear inside an SVG document. */}
      <image
        href={wheelBackgroundUrl(BACKDROP_COLOR)}
        x={VIEW_X}
        width={VIEW_WIDTH}
        height={VIEWBOX_HEIGHT}
        preserveAspectRatio="xMidYMid slice"
      />

      {/* The wheel face. */}
      <circle cx={CENTRE.x} cy={CENTRE.y} r={WHEEL_SIZE / 2} fill={FACE} />

      <g
        style={{
          // Translate-rotate-translate rather than `transform-origin`: an SVG
          // element's `transform-box` is the *view box*, so an origin in px
          // would be measured from VIEW_X rather than from user-space zero and
          // the whole wheel would pivot off-centre.
          transform: `translate(${CENTRE.x}px, ${CENTRE.y}px) rotate(${rotationDeg}deg) translate(${-CENTRE.x}px, ${-CENTRE.y}px)`,
          transition: "transform 500ms ease-in-out",
        }}
      >
        {Array.from({ length: placeholderCount }, (_, i) => {
          const segment = habits.length + i;
          const point = pointOnCircle(
            CENTRE,
            BUTTON_RADIUS,
            angleForSegment(segment),
          );
          return (
            <circle
              key={`placeholder-${segment}`}
              cx={svgNumber(point.x)}
              cy={svgNumber(point.y)}
              r={RING_RADIUS}
              fill="none"
              stroke={PLACEHOLDER}
              strokeWidth={RING_STROKE * 0.6}
              strokeDasharray={`${RING_STROKE * 2} ${RING_STROKE * 2}`}
            />
          );
        })}

        <AddButton
          point={pointOnCircle(
            CENTRE,
            BUTTON_RADIUS,
            angleForSegment(totalSegments - 1),
          )}
        />

        {habits.map((habit, index) => {
          const angle = angleForSegment(index);
          return (
            <HabitButton
              key={habit.id}
              habit={habit}
              point={pointOnCircle(CENTRE, BUTTON_RADIUS, angle)}
              angle={angle}
              selected={index === selectedIndex}
              clipId={`${idPrefix}-fill-${habit.id}`}
              onSelect={() => onSelect(habit.id)}
              onIncrement={() => onIncrement(habit.id)}
            />
          );
        })}
      </g>
    </svg>
  );
}

// ── One habit button ─────────────────────────────────────────────────────────

interface HabitButtonProps {
  habit: WheelHabit;
  point: { x: number; y: number };
  angle: number;
  selected: boolean;
  clipId: string;
  onSelect: () => void;
  onIncrement: () => void;
}

function HabitButton({
  habit,
  point,
  angle,
  selected,
  clipId,
  onSelect,
  onIncrement,
}: HabitButtonProps) {
  const Icon = habit.icon;
  const arcValue = habit.todayCount / habit.suggestedDailyCount;

  // The label's offset from the button centre, pointing back at the hub. The
  // button group is translated but never rotated, so the inward unit vector has
  // to be worked out here rather than taken from a rotated local frame.
  const labelPoint = {
    x: -Math.cos(angle) * LABEL_RADIUS,
    y: -Math.sin(angle) * LABEL_RADIUS,
  };
  const labelDeg = (angle * 180) / Math.PI + 90;

  // Selecting and incrementing are the same gesture, as they are in the app:
  // tapping a button ticks the habit off, and the wheel turns it to the top.
  function activate() {
    onSelect();
    onIncrement();
  }

  const label = `${habit.name}, ${habit.todayCount} of ${habit.suggestedDailyCount} today. Add one.`;

  return (
    <g transform={`translate(${svgNumber(point.x)} ${svgNumber(point.y)})`}>
      <g
        role="button"
        tabIndex={0}
        aria-label={label}
        className="cursor-pointer focus:outline-none"
        onClick={activate}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
          }
        }}
      >
        {/* Hit area — the rings are thin strokes and the fill has gaps. */}
        <circle r={RING_BOX / 2} fill={FACE} />

        {selected ? (
          <circle
            r={RING_BOX / 2 + RING_STROKE}
            fill="none"
            strokeWidth={RING_STROKE * 0.5}
            opacity={0.45}
            // Paints derived from `habit.color` go through `style`, never a
            // presentation attribute: the colours are design tokens, and a
            // `var()` in an SVG attribute is not resolved.
            style={{ stroke: habit.color }}
          />
        ) : null}

        {/* Inner fill: the week's pace, rising like a level. */}
        <clipPath id={clipId}>
          <circle r={INNER_FILL_RADIUS} />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>
          <rect
            x={-INNER_FILL_RADIUS}
            y={-INNER_FILL_RADIUS}
            width={INNER_FILL_RADIUS * 2}
            height={INNER_FILL_RADIUS * 2}
            // Transitioning a transform rather than the rect's own height:
            // geometry attributes are not animatable everywhere, transforms are.
            // The app tweens this fill over 1100ms; same here.
            style={{
              fill: `color-mix(in oklab, ${habit.color} 40%, white)`,
              transform: `translateY(${(1 - habit.innerFill) * INNER_FILL_RADIUS * 2}px)`,
              transition: "transform 1100ms ease-in-out",
            }}
          />
        </g>

        {/* Base track, always visible under the sections. */}
        {ringTrack(habit.suggestedDailyCount).map((arc, i) => (
          <path
            key={`track-${i}`}
            d={arcPath({
              centre: { x: 0, y: 0 },
              radius: RING_RADIUS,
              ...arc,
            })}
            fill="none"
            stroke={TRACK}
            strokeWidth={RING_STROKE}
          />
        ))}

        {ringFills({ arcValue, sections: habit.suggestedDailyCount }).map(
          (arc, i) => (
            <path
              key={`fill-${i}`}
              d={arcPath({
                centre: { x: 0, y: 0 },
                radius: RING_RADIUS,
                ...arc,
              })}
              fill="none"
              strokeWidth={RING_STROKE}
              style={{ stroke: lapStroke(habit.color, arc.lap) }}
            />
          ),
        )}

        {/* Dividers, painted in the face colour rather than the Dart's literal
            white — see the note on `ringDividers`. */}
        {ringDividers(habit.suggestedDailyCount).map((arc, i) => (
          <path
            key={`divider-${i}`}
            d={arcPath({
              centre: { x: 0, y: 0 },
              radius: RING_RADIUS,
              ...arc,
            })}
            fill="none"
            stroke={FACE}
            strokeWidth={RING_STROKE}
          />
        ))}

        <Icon
          x={-ICON_SIZE / 2}
          y={-ICON_SIZE / 2}
          width={ICON_SIZE}
          height={ICON_SIZE}
          color={INK}
          aria-hidden
        />
      </g>

      {/* The label sits between the button and the wheel's hub, tangent to the
          rim — as it does in the app. It has to be placed along the radius
          rather than simply dropped below the button and spun: a rotation about
          the label's own anchor turns the glyphs without moving them, so every
          label but the one at twelve o'clock would end up beside its button. */}
      <text
        x={svgNumber(labelPoint.x)}
        y={svgNumber(labelPoint.y)}
        transform={`rotate(${svgNumber(labelDeg)} ${svgNumber(labelPoint.x)} ${svgNumber(labelPoint.y)})`}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={LABEL_FONT_SIZE}
        fontWeight={600}
        fill={INK}
        aria-hidden
      >
        {habit.name}
      </text>
    </g>
  );
}

/** The last slice: the app's add-a-habit button. Decorative here. */
function AddButton({ point }: { point: { x: number; y: number } }) {
  return (
    <g
      transform={`translate(${svgNumber(point.x)} ${svgNumber(point.y)})`}
      aria-hidden
    >
      <circle
        r={RING_RADIUS}
        fill="none"
        stroke={PLACEHOLDER}
        strokeWidth={RING_STROKE * 0.6}
        strokeDasharray={`${RING_STROKE * 2} ${RING_STROKE * 2}`}
      />
      <Plus
        x={-ICON_SIZE / 2}
        y={-ICON_SIZE / 2}
        width={ICON_SIZE}
        height={ICON_SIZE}
        color={PLACEHOLDER}
      />
    </g>
  );
}
