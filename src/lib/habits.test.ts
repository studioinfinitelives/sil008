import { describe, expect, test } from "vitest";
import {
  computeDayCompletionFraction,
  computeExpectedPace,
  computeInnerFillFraction,
  computePaceDays,
  computeStaticDailyCount,
  firstActiveWeekday,
  getWeekMonday,
  isOnPaceForWeek,
  isoWeekday,
  Weekday,
} from "./habits";

/**
 * Unit tests for the ported habit math in `lib/habits.ts`.
 *
 * Mirrors `sil006/test/utils/habits_test.dart` case-for-case: same fixture
 * week, same inputs, same expected values. The Dart suite is the oracle — if a
 * case here is changed, it has stopped testing the app's behaviour.
 *
 * The fixed week used throughout is the week of Monday 2024-06-10
 * (Tue 6-11, Wed 6-12, Fri 6-14, Sat 6-15, Sun 6-16).
 */

// Concrete days within one ISO week so weekday math is unambiguous.
// Month is 0-indexed in JS: 5 = June.
const monday = new Date(2024, 5, 10);
const tuesday = new Date(2024, 5, 11);
const wednesday = new Date(2024, 5, 12);
const friday = new Date(2024, 5, 14);
const saturday = new Date(2024, 5, 15);
const sunday = new Date(2024, 5, 16);

// Sanity check the calendar assumptions the cases rely on.
test("fixture week has the expected ISO weekdays", () => {
  expect(isoWeekday(monday)).toBe(Weekday.monday);
  expect(isoWeekday(tuesday)).toBe(Weekday.tuesday);
  expect(isoWeekday(wednesday)).toBe(Weekday.wednesday);
  expect(isoWeekday(friday)).toBe(Weekday.friday);
  expect(isoWeekday(saturday)).toBe(Weekday.saturday);
  expect(isoWeekday(sunday)).toBe(Weekday.sunday);
});

// Not in the Dart suite: guards the 0=Sun/1=Mon substitution this port had to
// make. Sunday is where the two conventions disagree most loudly.
describe("getWeekMonday (port-specific)", () => {
  test("every day of the fixture week maps back to Monday", () => {
    for (const day of [monday, tuesday, wednesday, friday, saturday, sunday]) {
      expect(getWeekMonday(day).getTime()).toBe(monday.getTime());
    }
  });

  test("preserves time-of-day", () => {
    const fridayAfternoon = new Date(2024, 5, 14, 13, 45, 30, 250);
    const result = getWeekMonday(fridayAfternoon);
    expect(result.getDate()).toBe(10);
    expect(result.getHours()).toBe(13);
    expect(result.getMinutes()).toBe(45);
    expect(result.getSeconds()).toBe(30);
    expect(result.getMilliseconds()).toBe(250);
  });
});

describe("firstActiveWeekday", () => {
  test("null activatedAt → 1 (full week)", () => {
    expect(firstActiveWeekday({ weekMonday: monday, activatedAt: null })).toBe(
      1,
    );
  });

  test("activatedAt before this Monday → 1", () => {
    const lastWeek = new Date(2024, 5, 5);
    expect(
      firstActiveWeekday({ weekMonday: monday, activatedAt: lastWeek }),
    ).toBe(1);
  });

  test('activatedAt on Monday is not "before" → 1', () => {
    expect(
      firstActiveWeekday({ weekMonday: monday, activatedAt: monday }),
    ).toBe(1);
  });

  test("activatedAt mid-week → that weekday", () => {
    expect(
      firstActiveWeekday({ weekMonday: monday, activatedAt: wednesday }),
    ).toBe(3);
  });
});

describe("computePaceDays", () => {
  test("daily habit (empty schedule), no activation trim", () => {
    const r = computePaceDays({
      daysOfWeek: [],
      dayOfWeek: Weekday.wednesday,
      weekMonday: monday,
      activatedAt: null,
    });
    expect(r.perWeek).toBe(7);
    expect(r.passed).toBe(3);
  });

  test("custom MWF schedule through Friday", () => {
    const r = computePaceDays({
      daysOfWeek: [1, 3, 5],
      dayOfWeek: Weekday.friday,
      weekMonday: monday,
      activatedAt: null,
    });
    expect(r.perWeek).toBe(3);
    expect(r.passed).toBe(3);
  });

  test("custom MWF schedule on Tuesday counts only Monday so far", () => {
    const r = computePaceDays({
      daysOfWeek: [1, 3, 5],
      dayOfWeek: Weekday.tuesday,
      weekMonday: monday,
      activatedAt: null,
    });
    expect(r.perWeek).toBe(3);
    expect(r.passed).toBe(1);
  });

  test("activation mid-week trims earlier scheduled days", () => {
    const r = computePaceDays({
      daysOfWeek: [1, 3, 5],
      dayOfWeek: Weekday.friday,
      weekMonday: monday,
      activatedAt: wednesday,
    });
    expect(r.perWeek).toBe(2); // W,F remain
    expect(r.passed).toBe(2);
  });

  test("passed is clamped to a minimum of 1 (safe divisor)", () => {
    // W,F schedule viewed on Monday → no scheduled day has passed yet.
    const r = computePaceDays({
      daysOfWeek: [3, 5],
      dayOfWeek: Weekday.monday,
      weekMonday: monday,
      activatedAt: null,
    });
    expect(r.perWeek).toBe(2);
    expect(r.passed).toBe(1);
  });
});

describe("computeStaticDailyCount", () => {
  test("flat target rounds up over active days", () => {
    expect(computeStaticDailyCount({ daysOfWeek: [1, 3, 5], goal: 10 })).toBe(
      4,
    );
  });

  test("daily schedule divides by 7", () => {
    expect(computeStaticDailyCount({ daysOfWeek: [], goal: 7 })).toBe(1);
    expect(computeStaticDailyCount({ daysOfWeek: [], goal: 8 })).toBe(2);
  });
});

describe("computeExpectedPace", () => {
  test("empty daysOfWeek divides by 7", () => {
    expect(computeExpectedPace({ daysOfWeek: [], goal: 7 })).toBe(1.0);
    expect(computeExpectedPace({ daysOfWeek: [], goal: 14 })).toBe(2.0);
  });

  test("scheduled days drive the divisor", () => {
    // goal 6 over 3 active days → 2.0 per day.
    expect(computeExpectedPace({ daysOfWeek: [1, 3, 5], goal: 6 })).toBeCloseTo(
      2.0,
      9,
    );
  });
});

describe("computeDayCompletionFraction", () => {
  test("on pace yields 1.0", () => {
    expect(computeDayCompletionFraction({ count: 1, expectedPace: 1.0 })).toBe(
      1.0,
    );
  });

  test("over pace is uncapped (mirrors the per-day calendar scoring)", () => {
    // A single day is not capped — a 2x day reads 2.0; the caller clamps the
    // averaged result, not the individual day.
    expect(computeDayCompletionFraction({ count: 2, expectedPace: 1.0 })).toBe(
      2.0,
    );
  });

  test("below pace is a partial fraction", () => {
    expect(
      computeDayCompletionFraction({ count: 1, expectedPace: 2.0 }),
    ).toBeCloseTo(0.5, 9);
  });

  test("non-positive pace returns 0", () => {
    expect(computeDayCompletionFraction({ count: 5, expectedPace: 0.0 })).toBe(
      0,
    );
    expect(computeDayCompletionFraction({ count: 5, expectedPace: -1.0 })).toBe(
      0,
    );
  });

  test("zero count returns 0", () => {
    expect(computeDayCompletionFraction({ count: 0, expectedPace: 1.0 })).toBe(
      0,
    );
  });
});

describe("computeInnerFillFraction", () => {
  // expectedPace 1.0 == goal 5 over a 5-day schedule.
  test("on pace yields full fill", () => {
    expect(
      computeInnerFillFraction({
        weekCount: 1,
        expectedPace: 1.0,
        activeDaysPassedSafe: 1,
      }),
    ).toBe(1.0);
  });

  test("behind pace yields a partial fill", () => {
    expect(
      computeInnerFillFraction({
        weekCount: 1,
        expectedPace: 1.0,
        activeDaysPassedSafe: 3,
      }),
    ).toBeCloseTo(1 / 3, 9);
  });

  test("over pace is clamped to 1.0", () => {
    expect(
      computeInnerFillFraction({
        weekCount: 10,
        expectedPace: 1.0,
        activeDaysPassedSafe: 1,
      }),
    ).toBe(1.0);
  });

  test("coopHalf doubles the fraction", () => {
    expect(
      computeInnerFillFraction({
        weekCount: 1,
        expectedPace: 1.0,
        activeDaysPassedSafe: 2,
        coopHalf: true,
      }),
    ).toBeCloseTo(1.0, 9); // base 0.5 × 2
  });

  test("coopHalf still clamps to 1.0", () => {
    expect(
      computeInnerFillFraction({
        weekCount: 2,
        expectedPace: 1.0,
        activeDaysPassedSafe: 2,
        coopHalf: true,
      }),
    ).toBe(1.0);
  });

  test("zero expectedPace / passed are guarded (no divide-by-zero)", () => {
    const fill = computeInnerFillFraction({
      weekCount: 1,
      expectedPace: 0,
      activeDaysPassedSafe: 0,
    });
    expect(fill).toBeGreaterThanOrEqual(0.0);
    expect(fill).toBeLessThanOrEqual(1.0);
  });
});

// The wheel's hide-on-pace toggle hides exactly the habits this returns true
// for, so every case here doubles as "the button the user saw read full".
describe("isOnPaceForWeek", () => {
  test("exactly on pace is on pace", () => {
    expect(
      isOnPaceForWeek({
        weekCount: 3,
        expectedPace: 1.0,
        activeDaysPassedSafe: 3,
      }),
    ).toBe(true);
  });

  test("one count short is not on pace", () => {
    expect(
      isOnPaceForWeek({
        weekCount: 2,
        expectedPace: 1.0,
        activeDaysPassedSafe: 3,
      }),
    ).toBe(false);
  });

  test("ahead of pace is on pace", () => {
    expect(
      isOnPaceForWeek({
        weekCount: 9,
        expectedPace: 1.0,
        activeDaysPassedSafe: 3,
      }),
    ).toBe(true);
  });

  test("a fractional pace short of the day is not on pace", () => {
    // goal 5 over a 7-day schedule → 0.714 per day; 2 counts by Wednesday
    // (3 active days) leaves the fill at 0.93.
    expect(
      isOnPaceForWeek({
        weekCount: 2,
        expectedPace: 5 / 7,
        activeDaysPassedSafe: 3,
      }),
    ).toBe(false);
  });

  test("2-person coop: own half done is on pace only with coopHalf", () => {
    expect(
      isOnPaceForWeek({
        weekCount: 1,
        expectedPace: 1.0,
        activeDaysPassedSafe: 2,
        coopHalf: true,
      }),
    ).toBe(true);
    expect(
      isOnPaceForWeek({
        weekCount: 1,
        expectedPace: 1.0,
        activeDaysPassedSafe: 2,
      }),
    ).toBe(false);
  });

  test("an unstamped expectedPace scores like the button (pace of 1)", () => {
    // A pre-expectedPace doc: the fill guard divides by 1, so a count for
    // every day passed still reads full — hiding must agree with what the
    // wheel paints, not invent a stricter rule.
    expect(
      isOnPaceForWeek({
        weekCount: 2,
        expectedPace: 0,
        activeDaysPassedSafe: 2,
      }),
    ).toBe(true);
    expect(
      isOnPaceForWeek({
        weekCount: 1,
        expectedPace: 0,
        activeDaysPassedSafe: 2,
      }),
    ).toBe(false);
  });
});
