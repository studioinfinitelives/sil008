import { describe, expect, it } from "vitest";
import {
  arcPath,
  lapShadeIndex,
  MAX_LAP_SHADE,
  MIN_WHEEL_SEGMENTS,
  pointOnCircle,
  RING_GAP_ANGLE,
  ringDividers,
  ringFills,
  ringSectionCount,
  ringTrack,
  roundHalfAwayFromZero,
  WheelGeometry,
  wheelSegmentsFor,
} from "@/lib/wheel";

const TAU = Math.PI * 2;

/** Total angle a list of arcs covers. */
function totalSweep(arcs: ReadonlyArray<{ sweep: number }>): number {
  return arcs.reduce((sum, arc) => sum + arc.sweep, 0);
}

describe("roundHalfAwayFromZero", () => {
  it("matches Math.round away from the half cases", () => {
    for (const value of [0, 0.4, 1.6, -0.4, -1.6, 12.3]) {
      expect(roundHalfAwayFromZero(value)).toBe(Math.round(value));
    }
  });

  it("rounds a negative half away from zero, where Math.round does not", () => {
    expect(roundHalfAwayFromZero(-2.5)).toBe(-3);
    expect(Math.round(-2.5)).toBe(-2);
  });

  it("rounds a positive half up, same as Dart", () => {
    expect(roundHalfAwayFromZero(2.5)).toBe(3);
  });
});

describe("wheelSegmentsFor", () => {
  it("floors an empty or near-empty wheel at the minimum", () => {
    expect(wheelSegmentsFor(0)).toBe(MIN_WHEEL_SEGMENTS);
    expect(wheelSegmentsFor(8)).toBe(MIN_WHEEL_SEGMENTS);
  });

  it("leaves one slice for the edit button once habits outgrow the minimum", () => {
    expect(wheelSegmentsFor(9)).toBe(10);
    expect(wheelSegmentsFor(10)).toBe(11);
    expect(wheelSegmentsFor(23)).toBe(24);
  });

  it("never leaves a negative placeholder count", () => {
    for (let habits = 0; habits <= 30; habits++) {
      // habits, then placeholders, then the edit button in the last slice.
      expect(wheelSegmentsFor(habits) - habits - 1).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("WheelGeometry", () => {
  it("rejects a wheel with no segments", () => {
    expect(() => new WheelGeometry({ totalSegments: 0 })).toThrow(
      /at least one segment/,
    );
  });

  it("divides the circle evenly", () => {
    const geometry = new WheelGeometry({ totalSegments: 10 });
    expect(geometry.segmentAngle).toBeCloseTo(TAU / 10, 12);
  });

  it("needs no offset when the segment count is a multiple of four", () => {
    for (const totalSegments of [4, 8, 12, 20]) {
      expect(new WheelGeometry({ totalSegments }).segmentOffset).toBe(0);
    }
  });

  it("offsets by a quarter-slice per leftover quarter otherwise", () => {
    const geometry = new WheelGeometry({ totalSegments: 10 });
    // 10 % 4 == 2, so half a slice.
    expect(geometry.segmentOffset).toBeCloseTo(geometry.segmentAngle / 2, 12);
  });

  it("opens with the first segment parked at twelve o'clock", () => {
    // Whatever the segment count, the offset and the floored quarter-turn
    // cancel out to exactly a quarter turn anticlockwise — which is straight up
    // in SVG's y-down space. This is the invariant the whole layout leans on.
    for (const totalSegments of [4, 7, 10, 11, 12, 13, 24]) {
      expect(new WheelGeometry({ totalSegments }).restAngle).toBeCloseTo(
        -Math.PI / 2,
        12,
      );
    }
  });

  it("opens settled, not mid-snap", () => {
    const geometry = new WheelGeometry({ totalSegments: 10 });
    expect(geometry.snapTargetFor(geometry.restAngle)).toBeCloseTo(
      geometry.restAngle,
      12,
    );
  });

  it("wraps a negative rotation into a non-negative segment index", () => {
    const geometry = new WheelGeometry({ totalSegments: 10 });
    for (let step = -25; step <= 25; step++) {
      const segment = geometry.segmentForAngle(geometry.angleForSegment(step));
      expect(segment).toBeGreaterThanOrEqual(0);
      expect(segment).toBeLessThan(10);
      // Same slice modulo a whole turn, counted the way Dart's % counts.
      expect(segment).toBe(((step % 10) + 10) % 10);
    }
  });

  it("snaps to the centre of the nearest segment", () => {
    const geometry = new WheelGeometry({ totalSegments: 10 });
    const target = geometry.angleForSegment(3);
    // Nudged either side of a segment centre, it settles back on it.
    expect(
      geometry.snapTargetFor(target + geometry.segmentAngle * 0.3),
    ).toBeCloseTo(target, 12);
    expect(
      geometry.snapTargetFor(target - geometry.segmentAngle * 0.3),
    ).toBeCloseTo(target, 12);
  });

  it("does not unwind a full revolution when snapping", () => {
    const geometry = new WheelGeometry({ totalSegments: 10 });
    // Three turns out, the target stays three turns out rather than wrapping.
    const wound = geometry.angleForSegment(30);
    expect(geometry.snapTargetFor(wound)).toBeCloseTo(wound, 12);
    expect(geometry.snapTargetFor(wound)).toBeGreaterThan(TAU * 2);
  });

  it("parks the requested segment at the top", () => {
    const geometry = new WheelGeometry({ totalSegments: 13 });
    for (let segment = 0; segment < 13; segment++) {
      expect(geometry.segmentForAngle(geometry.angleForSegment(segment))).toBe(
        segment,
      );
    }
  });
});

describe("ringSectionCount", () => {
  it("clamps to at least one section", () => {
    expect(ringSectionCount(0)).toBe(1);
    expect(ringSectionCount(-3)).toBe(1);
  });

  it("clamps to the app's suggested-daily-count ceiling", () => {
    expect(ringSectionCount(20)).toBe(20);
    expect(ringSectionCount(50)).toBe(20);
  });
});

describe("ringTrack", () => {
  it("covers the circle apart from the gaps", () => {
    const sections = 5;
    expect(totalSweep(ringTrack(sections))).toBeCloseTo(
      TAU - sections * RING_GAP_ANGLE,
      12,
    );
  });

  it("is an unbroken circle when there is a single section", () => {
    const track = ringTrack(1);
    expect(track).toHaveLength(1);
    expect(track[0]?.sweep).toBeCloseTo(TAU, 12);
  });

  it("starts at twelve o'clock", () => {
    expect(ringTrack(4)[0]?.start).toBeCloseTo(-Math.PI / 2, 12);
  });
});

describe("ringDividers", () => {
  it("draws one gap per section, at every count", () => {
    for (const sections of [2, 3, 7, 20]) {
      const dividers = ringDividers(sections);
      expect(dividers).toHaveLength(sections);
      expect(totalSweep(dividers)).toBeCloseTo(sections * RING_GAP_ANGLE, 12);
    }
  });

  it("fills exactly the space the track leaves", () => {
    const sections = 6;
    expect(
      totalSweep(ringTrack(sections)) + totalSweep(ringDividers(sections)),
    ).toBeCloseTo(TAU, 12);
  });

  it("places each divider immediately after its section", () => {
    const sections = 4;
    const track = ringTrack(sections);
    const dividers = ringDividers(sections);
    for (let i = 0; i < sections; i++) {
      const section = track[i];
      const divider = dividers[i];
      expect(section).toBeDefined();
      expect(divider).toBeDefined();
      expect(divider?.start).toBeCloseTo(
        (section?.start ?? 0) + (section?.sweep ?? 0),
        12,
      );
    }
  });
});

describe("lapShadeIndex", () => {
  it("darkens for the first laps and then holds", () => {
    expect(lapShadeIndex(0)).toBe(0);
    expect(lapShadeIndex(1)).toBe(1);
    expect(lapShadeIndex(2)).toBe(2);
    expect(lapShadeIndex(3)).toBe(MAX_LAP_SHADE);
    expect(lapShadeIndex(99)).toBe(MAX_LAP_SHADE);
  });
});

describe("ringFills", () => {
  it("draws nothing at a count of zero", () => {
    expect(ringFills({ arcValue: 0, sections: 4 })).toEqual([]);
    expect(ringFills({ arcValue: -1, sections: 4 })).toEqual([]);
  });

  it("fills one section per whole step of the daily count", () => {
    const sections = 4;
    // Two of four ticked off.
    const fills = ringFills({ arcValue: 0.5, sections });
    expect(fills).toHaveLength(2);
    expect(totalSweep(fills)).toBeCloseTo(
      totalSweep(ringTrack(sections)) / 2,
      12,
    );
  });

  it("part-fills the section the budget runs out in", () => {
    const fills = ringFills({ arcValue: 0.625, sections: 4 });
    // Two whole sections and half of the third.
    expect(fills).toHaveLength(3);
    const full = ringTrack(4)[0]?.sweep ?? 0;
    expect(fills[0]?.sweep).toBeCloseTo(full, 12);
    expect(fills[1]?.sweep).toBeCloseTo(full, 12);
    expect(fills[2]?.sweep).toBeCloseTo(full / 2, 12);
  });

  it("closes the ring exactly at the daily count", () => {
    const sections = 5;
    const fills = ringFills({ arcValue: 1, sections });
    expect(fills).toHaveLength(sections);
    expect(fills.every((fill) => fill.lap === 0)).toBe(true);
    expect(totalSweep(fills)).toBeCloseTo(totalSweep(ringTrack(sections)), 12);
  });

  it("laps, and darkens as it does", () => {
    const sections = 4;
    const fills = ringFills({ arcValue: 1.5, sections });
    // A complete first lap, then half of the second.
    expect(fills.filter((fill) => fill.lap === 0)).toHaveLength(sections);
    expect(fills.filter((fill) => fill.lap === 1)).toHaveLength(sections / 2);
  });

  it("stops emitting laps once the shade stops changing", () => {
    const sections = 3;
    const fills = ringFills({ arcValue: 12, sections });
    const laps = new Set(fills.map((fill) => fill.lap));
    // Laps beyond the last shade would repaint in an identical colour.
    expect(Math.max(...laps)).toBe(MAX_LAP_SHADE);
    expect(fills).toHaveLength(sections * (MAX_LAP_SHADE + 1));
  });

  it("handles an unbroken single-section ring", () => {
    const fills = ringFills({ arcValue: 0.25, sections: 1 });
    expect(fills).toHaveLength(1);
    expect(fills[0]?.sweep).toBeCloseTo(TAU / 4, 12);
  });
});

describe("pointOnCircle", () => {
  const centre = { x: 100, y: 100 };

  it("puts the arc start at twelve o'clock", () => {
    const point = pointOnCircle(centre, 50, -Math.PI / 2);
    expect(point.x).toBeCloseTo(100, 9);
    expect(point.y).toBeCloseTo(50, 9);
  });

  it("sweeps clockwise, because SVG's y axis points down", () => {
    // A quarter turn on from the top is three o'clock, not nine.
    const point = pointOnCircle(centre, 50, 0);
    expect(point.x).toBeCloseTo(150, 9);
    expect(point.y).toBeCloseTo(100, 9);
  });
});

describe("arcPath", () => {
  const centre = { x: 0, y: 0 };

  it("draws a partial arc as a single command", () => {
    const path = arcPath({ centre, radius: 10, start: 0, sweep: Math.PI / 2 });
    expect(path).toMatch(/^M .* A .*$/);
    expect(path.match(/A /g)).toHaveLength(1);
  });

  it("flags the long way round past a half turn", () => {
    const short = arcPath({ centre, radius: 10, start: 0, sweep: Math.PI / 2 });
    const long = arcPath({
      centre,
      radius: 10,
      start: 0,
      sweep: Math.PI * 1.5,
    });
    expect(short).toContain(" 0 0 1 ");
    expect(long).toContain(" 0 1 1 ");
  });

  it("splits a full turn in two, since one arc command cannot close a circle", () => {
    const path = arcPath({ centre, radius: 10, start: 0, sweep: TAU });
    expect(path.match(/A /g)).toHaveLength(2);
  });
});
