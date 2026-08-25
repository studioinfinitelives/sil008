/**
 * Shared habit math, ported from the Habi Sloth app's `lib/utils/habits.dart`.
 *
 * The Dart original is the source of truth: it is what the app ships and what
 * the Python backend mirrors. Nothing the site renders calls this today — the
 * demos it was ported for have been removed — but it is kept, with its test
 * suite mirroring `habits_test.dart`, as the checked reference any future
 * explainer of how goals and pace work should be built on rather than
 * re-derived. If this and the Dart ever disagree, this one is wrong.
 *
 * Two substitutions were unavoidable in the crossing:
 *
 * - **`Timestamp?` → `Date | null`.** The Dart signatures take a Firestore
 *   `Timestamp`. This site has no Firestore dependency (and no live data at
 *   all), so the equivalent plain `Date` stands in. `Timestamp.fromDate(d)` in
 *   a Dart caller is simply `d` here.
 * - **Dart `weekday` → {@link isoWeekday}.** Dart numbers weekdays 1=Mon…7=Sun.
 *   JavaScript's `Date.getDay()` numbers them 0=Sun…6=Sat. Every weekday value
 *   in this module is the *Dart* convention; `getDay()` is never used raw.
 */

/**
 * Upper clamp for any Suggested Daily Count — a sanity ceiling that should
 * never be hit in practice, kept in one place so every clamp agrees.
 */
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
 * The seven legal weekday values.
 *
 * Every `daysOfWeek` parameter in this module is typed as
 * `readonly WeekdayNumber[]` rather than `readonly number[]`, so a schedule
 * containing `0` or `9` cannot be constructed in the first place. Values
 * *derived* from a `Date` (see {@link isoWeekday}) stay plain `number` — they
 * are already constrained by arithmetic, and narrowing them would need a cast
 * that asserts what the Dart original simply guarantees.
 */
export type WeekdayNumber = (typeof Weekday)[keyof typeof Weekday];

// ── Small helpers that Dart provides in its standard library ─────────────────

/** Dart's `num.clamp(lower, upper)`, which TypeScript has no equivalent of. */
function clamp(value: number, lower: number, upper: number): number {
  return Math.min(Math.max(value, lower), upper);
}

/**
 * ISO weekday (1=Mon…7=Sun) — Dart's `DateTime.weekday`.
 *
 * `Date.getDay()` returns 0 for Sunday, so it cannot be used directly anywhere
 * a Dart `weekday` was expected.
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
 * Monday (ISO weekday 1) of the week containing `date`. Preserves `date`'s
 * time-of-day; pass a date-only value (or read only y/m/d from the result)
 * when a midnight boundary matters.
 *
 * Note: Dart subtracts a `Duration`, which is absolute elapsed time and so can
 * shift the wall-clock hour across a DST boundary. This version does calendar
 * arithmetic on the date components, which preserves time-of-day exactly. The
 * two agree except in that DST edge case, where this one is the more correct.
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
 * Returns the ISO weekday (1=Mon…7=Sun) of the first active day in the week
 * starting at `weekMonday`, respecting when the habit was activated.
 *
 * Returns 1 (Monday) when `activatedAt` is null or falls before `weekMonday`,
 * meaning the full schedule is in play for this week.
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
 * Computes the effective (perWeek, passed) active-day counts for pace
 * calculations, trimming days that fall before the habit's `activatedAt`
 * within the current week.
 *
 * Both returned values are ≥ 1, so either is safe to use as a divisor.
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
 * Expected pace = target completions per active day = `goal / scheduled days`.
 *
 * Uses the full schedule length (never trimmed by `activatedAt`), matching the
 * "Expected Pace" term in {@link computeInnerFillFraction} and
 * {@link computeStaticDailyCount}.
 *
 * In the app this value is stamped onto each activity at write time and read
 * back instead of being recomputed — so historical days keep the pace they were
 * created with even after the habit's goal or schedule changes.
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
 * One day's completion fraction for a single habit: `count / expectedPace`.
 *
 * The canonical per-day scoring used by the calendar's monthly completion and
 * heatmap. A single day is scored against the full daily `expectedPace` and is
 * **uncapped** — an over-performing day can offset a weaker one; only the
 * averaged result should be clamped. Returns 0 when the pace is non-positive
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
 * Static (non-dynamic) SDC: a flat daily target, the same every active day,
 * that ignores missed days (no catch-up). Computed as `⌈goal / activeDays⌉`.
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
  /**
   * The activity's stored expected pace, falling back to
   * {@link computeExpectedPace} for legacy docs.
   */
  expectedPace: number;
  /**
   * Active days elapsed this week — take {@link computePaceDays}'s `passed`,
   * which correctly trims days before `activatedAt`.
   */
  activeDaysPassedSafe: number;
  /**
   * For 2-person coop: each user is responsible for half the goal, so the
   * result is doubled before clamping.
   */
  coopHalf?: boolean;
}

/**
 * Computes the inner-fill fraction (0.0–1.0) for a habit wheel button,
 * representing "Is the user on pace?"
 *
 * ```
 * Expected Pace = goal / totalScheduleDays   (stamped per activity)
 * Actual Pace   = weekCount / activeDaysPassedSafe
 * fill          = Actual Pace / Expected Pace
 *               = weekCount / (activeDaysPassedSafe × expectedPace)
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
 * True when the habit is on pace for the week — i.e. the wheel button's inner
 * fill reads full. Deliberately a one-line delegation to
 * {@link computeInnerFillFraction} so "hidden by the wheel's hide-on-pace
 * toggle" and "the button the user last saw was full" can never drift apart.
 *
 * A non-positive `expectedPace` (a doc written before the field was stamped) is
 * handled by {@link computeInnerFillFraction}'s divisor guard, not re-handled
 * here — same input, same answer as the button.
 */
export function isOnPaceForWeek(params: InnerFillFractionParams): boolean {
  return computeInnerFillFraction(params) >= 1;
}
