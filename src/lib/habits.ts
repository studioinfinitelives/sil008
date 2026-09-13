/**
 * Habit math ported from the app's `lib/utils/habits.dart`.
 *
 * UNUSED BY THE SITE — the demos it was ported for were removed. Kept
 * deliberately, with its test suite mirroring `habits_test.dart`, as the
 * checked reference for any future explainer of goals and pace. Do not delete
 * as dead code.
 *
 * The Dart original is the source of truth. If the two disagree, this is wrong.
 *
 * Two substitutions in the port:
 *
 * - `Timestamp?` → `Date | null`. This site has no Firestore.
 * - Dart `weekday` → `isoWeekday`. Dart is 1=Mon…7=Sun, `Date.getDay()` is
 *   0=Sun…6=Sat. Every weekday here is the DART convention; `getDay()` is
 *   never used raw.
 */

/** Sanity ceiling for any Suggested Daily Count, so every clamp agrees. */
export const MAX_SUGGESTED_DAILY_COUNT = 20;

/** ISO weekday numbers, matching Dart's `DateTime.monday`…`DateTime.sunday`. */
export const Weekday = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
} as const;

/**
 * Every `daysOfWeek` parameter is typed with this rather than `number[]`, so a
 * schedule containing 0 or 9 cannot be constructed. Values derived from a
 * `Date` stay plain `number`: arithmetic already constrains them, and narrowing
 * would need a cast.
 */
export type WeekdayNumber = (typeof Weekday)[keyof typeof Weekday];

// ── Helpers Dart provides in its standard library ────────────────────────────

/** Dart's `num.clamp`, which TypeScript has no equivalent of. */
function clamp(value: number, lower: number, upper: number): number {
  return Math.min(Math.max(value, lower), upper);
}

/**
 * Dart's `DateTime.weekday` (1=Mon…7=Sun). `Date.getDay()` returns 0 for
 * Sunday, so it cannot be used directly where a Dart weekday is expected.
 */
export function isoWeekday(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

/** Strips the time component, mirroring Dart's `DateTime(y, m, d)`. */
function dateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// ── Week boundary ────────────────────────────────────────────────────────────

/**
 * Monday of the week containing `date`, preserving time-of-day.
 *
 * Diverges from Dart: it subtracts a `Duration`, which is absolute elapsed time
 * and can shift the wall-clock hour across a DST boundary. This does calendar
 * arithmetic instead. The two agree except in that edge case.
 */
export function getWeekMonday(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - (isoWeekday(date) - 1),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
}

// ── Activation helper ────────────────────────────────────────────────────────

export interface FirstActiveWeekdayParams {
  /** Monday of the week in question (time component ignored). */
  weekMonday: Date;
  /** When the habit was last activated/created; `null` → full week. */
  activatedAt: Date | null;
}

/**
 * ISO weekday of the first active day in the week starting at `weekMonday`.
 * Returns 1 when `activatedAt` is null or predates the week, meaning the full
 * schedule is in play.
 */
export function firstActiveWeekday({
  weekMonday,
  activatedAt,
}: FirstActiveWeekdayParams): number {
  if (activatedAt === null) return 1;
  const activatedDate = dateOnly(activatedAt);
  const mondayDate = dateOnly(weekMonday);
  // "Not before" — an activation *on* Monday leaves the whole week in play.
  return activatedDate >= mondayDate ? isoWeekday(activatedAt) : 1;
}

// ── Core pace calculation ────────────────────────────────────────────────────

export interface PaceDaysParams {
  /** Scheduled ISO weekdays (1=Mon–7=Sun); empty means every day. */
  daysOfWeek: readonly WeekdayNumber[];
  /** Selected date's ISO weekday (1..7). */
  dayOfWeek: number;
  /** Monday of the selected week (time component ignored). */
  weekMonday: Date;
  /** When the habit was last activated/created; `null` → full week. */
  activatedAt: Date | null;
}

export interface PaceDays {
  perWeek: number;
  passed: number;
}

/**
 * Effective (perWeek, passed) active-day counts, trimming days before
 * `activatedAt`. Both values are ≥ 1, so either is safe as a divisor.
 */
export function computePaceDays({
  daysOfWeek,
  dayOfWeek,
  weekMonday,
  activatedAt,
}: PaceDaysParams): PaceDays {
  const first = firstActiveWeekday({ weekMonday, activatedAt });

  let perWeek: number;
  let passed: number;
  if (daysOfWeek.length === 0) {
    perWeek = clamp(8 - first, 1, 7);
    passed = clamp(dayOfWeek - first + 1, 0, 7);
  } else {
    perWeek = clamp(daysOfWeek.filter((d) => d >= first).length, 1, 7);
    passed = daysOfWeek.filter((d) => d >= first && d <= dayOfWeek).length;
  }
  return { perWeek, passed: clamp(passed, 1, 7) };
}

// ── Expected pace ────────────────────────────────────────────────────────────

export interface ExpectedPaceParams {
  /** Scheduled ISO weekdays; empty means every day (÷7). */
  daysOfWeek: readonly WeekdayNumber[];
  goal: number;
}

/**
 * `goal / scheduled days`. Uses the FULL schedule length, never trimmed by
 * `activatedAt`.
 *
 * In the app this is stamped onto each activity at write time and read back
 * rather than recomputed, so historical days keep the pace they were created
 * with after a goal or schedule change.
 */
export function computeExpectedPace({
  daysOfWeek,
  goal,
}: ExpectedPaceParams): number {
  const activeDays = daysOfWeek.length === 0 ? 7 : daysOfWeek.length;
  return goal / activeDays;
}

export interface DayCompletionFractionParams {
  /** For coop habits, pass the pooled count (self + all partners). */
  count: number;
  expectedPace: number;
}

/**
 * `count / expectedPace` — the calendar's per-day scoring.
 *
 * UNCAPPED: an over-performing day can offset a weaker one, so only the
 * averaged result should be clamped. Returns 0 for a non-positive pace
 * (legacy/zero-goal docs).
 */
export function computeDayCompletionFraction({
  count,
  expectedPace,
}: DayCompletionFractionParams): number {
  if (expectedPace <= 0) return 0;
  return count / expectedPace;
}

// ── Suggested Daily Count ────────────────────────────────────────────────────

/**
 * Static Suggested Daily Count: `⌈goal / activeDays⌉`. A flat target, the same
 * every active day, with no catch-up for missed days.
 */
export function computeStaticDailyCount({
  daysOfWeek,
  goal,
}: ExpectedPaceParams): number {
  return clamp(
    Math.ceil(computeExpectedPace({ daysOfWeek, goal })),
    1,
    MAX_SUGGESTED_DAILY_COUNT,
  );
}

// ── Inner-fill fraction ──────────────────────────────────────────────────────

export interface InnerFillFractionParams {
  weekCount: number;
  /** The activity's stored pace, or `computeExpectedPace` for legacy docs. */
  expectedPace: number;
  /** Take `computePaceDays`'s `passed`, which trims days before activation. */
  activeDaysPassedSafe: number;
  /** 2-person coop: each user owes half the goal, so the result is doubled. */
  coopHalf?: boolean;
}

/**
 * Wheel button inner fill, 0.0–1.0 — "is the user on pace?"
 *
 * ```
 * fill = weekCount / (activeDaysPassedSafe × expectedPace)
 * ```
 */
export function computeInnerFillFraction({
  weekCount,
  expectedPace,
  activeDaysPassedSafe,
  coopHalf = false,
}: InnerFillFractionParams): number {
  const safePassed = activeDaysPassedSafe > 0 ? activeDaysPassedSafe : 1;
  const safeExpectedPace = expectedPace > 0 ? expectedPace : 1;
  const fraction = weekCount / (safePassed * safeExpectedPace);
  return coopHalf ? clamp(fraction * 2, 0, 1) : clamp(fraction, 0, 1);
}

/**
 * True when the wheel button's inner fill reads full. A one-line delegation on
 * purpose, so "hidden by the hide-on-pace toggle" and "the button looked full"
 * cannot drift apart. A non-positive `expectedPace` is handled by the divisor
 * guard in `computeInnerFillFraction`, not re-handled here.
 */
export function isOnPaceForWeek(params: InnerFillFractionParams): boolean {
  return computeInnerFillFraction(params) >= 1;
}
