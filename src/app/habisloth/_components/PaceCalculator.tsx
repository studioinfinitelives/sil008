"use client";

import { useMemo, useState } from "react";
import {
  computeExpectedPace,
  computeStaticDailyCount,
  MAX_SUGGESTED_DAILY_COUNT,
  Weekday,
  type WeekdayNumber,
} from "@/lib/habits";

const DAY_LABELS: ReadonlyArray<{
  value: WeekdayNumber;
  short: string;
  full: string;
}> = [
  { value: Weekday.monday, short: "Mon", full: "Monday" },
  { value: Weekday.tuesday, short: "Tue", full: "Tuesday" },
  { value: Weekday.wednesday, short: "Wed", full: "Wednesday" },
  { value: Weekday.thursday, short: "Thu", full: "Thursday" },
  { value: Weekday.friday, short: "Fri", full: "Friday" },
  { value: Weekday.saturday, short: "Sat", full: "Saturday" },
  { value: Weekday.sunday, short: "Sun", full: "Sunday" },
];

const GOAL_MIN = 1;
const GOAL_MAX = 100;

/** Trims to one decimal, but drops a trailing `.0` so whole numbers read cleanly. */
function formatPace(pace: number): string {
  return Number.isInteger(pace) ? String(pace) : pace.toFixed(2);
}

/**
 * Interactive explainer for how a weekly goal becomes a daily target.
 *
 * Runs the same functions the app runs — see `lib/habits.ts`, ported from
 * `sil006/lib/utils/habits.dart` — so what this shows is what Habi Sloth
 * actually computes, not an approximation of it.
 */
export function PaceCalculator() {
  const [goal, setGoal] = useState(5);
  // Empty means "every day", exactly as the app's `daysOfWeek` does.
  const [days, setDays] = useState<readonly WeekdayNumber[]>([]);

  const result = useMemo(() => {
    const daysOfWeek = days;
    return {
      activeDays: daysOfWeek.length === 0 ? 7 : daysOfWeek.length,
      expectedPace: computeExpectedPace({ daysOfWeek, goal }),
      dailyCount: computeStaticDailyCount({ daysOfWeek, goal }),
    };
  }, [days, goal]);

  function toggleDay(value: WeekdayNumber) {
    setDays((current) =>
      current.includes(value)
        ? current.filter((d) => d !== value)
        : [...current, value].sort((a, b) => a - b),
    );
  }

  const everyDay = days.length === 0;

  return (
    <div className="border-line bg-surface flex flex-col gap-8 rounded-xl border p-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3 border-0">
          <label
            className="text-ink flex items-baseline justify-between gap-3 p-0 text-sm font-semibold tracking-wide uppercase"
            htmlFor="pace-goal"
          >
            Weekly goal
            <output className="text-2xl font-bold tracking-normal normal-case">
              {goal}
            </output>
          </label>
          <input
            id="pace-goal"
            className="range-input"
            type="range"
            min={GOAL_MIN}
            max={GOAL_MAX}
            value={goal}
            onChange={(event) => setGoal(Number(event.target.value))}
          />
        </div>

        <fieldset className="flex flex-col gap-3 border-0">
          <legend className="text-ink flex items-baseline justify-between gap-3 p-0 text-sm font-semibold tracking-wide uppercase">
            Scheduled days
          </legend>
          <div className="flex flex-wrap gap-2">
            {DAY_LABELS.map((day) => {
              const active = everyDay || days.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  className="border-line text-subtle aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-on-brand flex-1 basis-14 cursor-pointer rounded-md border bg-transparent px-2 py-3 text-sm font-semibold transition-colors"
                  aria-pressed={active}
                  aria-label={day.full}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.short}
                </button>
              );
            })}
          </div>
          <p className="text-subtle text-sm">
            {everyDay
              ? "No days picked, so the habit runs every day."
              : `${result.activeDays} day${result.activeDays === 1 ? "" : "s"} a week.`}
          </p>
        </fieldset>
      </div>

      <dl className="flex flex-wrap gap-5">
        <div className="bg-canvas flex-1 basis-48 rounded-md p-5">
          <dt className="text-subtle text-xs font-semibold tracking-wider uppercase">
            Expected pace
          </dt>
          <dd className="text-ink mt-2 flex items-baseline gap-2 text-3xl font-bold tabular-nums">
            {formatPace(result.expectedPace)}
            <span className="text-subtle text-[0.8125rem] font-medium">
              per active day
            </span>
          </dd>
        </div>
        <div className="bg-canvas flex-1 basis-48 rounded-md p-5">
          <dt className="text-subtle text-xs font-semibold tracking-wider uppercase">
            Suggested daily count
          </dt>
          <dd className="text-ink mt-2 flex items-baseline gap-2 text-3xl font-bold tabular-nums">
            {result.dailyCount}
            <span className="text-subtle text-[0.8125rem] font-medium">
              {result.dailyCount === MAX_SUGGESTED_DAILY_COUNT
                ? "capped"
                : "rounded up"}
            </span>
          </dd>
        </div>
      </dl>

      <p className="text-subtle text-[0.9375rem]">
        Expected pace is the exact share of the goal each active day carries,
        and it is what decides whether you are on pace. The suggested daily
        count rounds that up to something you can actually tick off, so hitting
        it every day finishes the week a little early.
      </p>
    </div>
  );
}
