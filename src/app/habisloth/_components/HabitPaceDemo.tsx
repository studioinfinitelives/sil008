"use client";

import type { LucideIcon } from "lucide-react";
import { BookOpen, Droplet, Dumbbell, Music, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import {
  HabitWheel,
  type WheelHabit,
} from "@/app/habisloth/_components/HabitWheel";
import {
  computeDayCompletionFraction,
  computeExpectedPace,
  computeInnerFillFraction,
  computePaceDays,
  computeStaticDailyCount,
  isOnPaceForWeek,
  MAX_SUGGESTED_DAILY_COUNT,
  Weekday,
  type WeekdayNumber,
} from "@/lib/habits";
import { MAX_LAP_SHADE } from "@/lib/wheel";

/**
 * The habit wheel, wired to the goal and pace maths that drive it in the app.
 *
 * This is the whole product argument in one control: a weekly goal and a
 * schedule are the only things you set, and everything else — the daily target,
 * the ring, whether you are on pace — falls out of them. Every number comes
 * from `lib/habits.ts`, the port of the app's own `habits.dart`, so what a
 * visitor sees here is what the app would compute.
 *
 * **"Today" is a control, not the clock.** `output: "export"` renders this
 * page's HTML once at build time, so a real `new Date()` would bake the build
 * day into the markup and then disagree with the browser on hydration. Making
 * the day an input dodges that, and is the better demo anyway: the point of
 * pace is that it moves through the week, which you cannot show if the day is
 * fixed.
 */

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

/**
 * Any Monday will do. `computePaceDays` only consults `weekMonday` to trim days
 * that fall before a habit's `activatedAt`, and these demo habits have none —
 * so the date never reaches the arithmetic. Fixed rather than derived so the
 * prerendered HTML cannot disagree with the browser.
 */
const WEEK_MONDAY = new Date(2026, 0, 5);

interface DemoHabit {
  id: string;
  name: string;
  icon: LucideIcon;
  /** A design token, resolved through `style` — see the note in HabitWheel. */
  color: string;
  goal: number;
  /** Empty means every day, exactly as the app's `daysOfWeek` does. */
  days: readonly WeekdayNumber[];
  /** Completions on earlier active days this week, before today. */
  earlierThisWeek: number;
  todayCount: number;
}

/**
 * Seed habits.
 *
 * Ordered so the one that opens selected sits in the middle of the run: the
 * wheel parks the selection at twelve o'clock, so a middle habit fans the rest
 * evenly either side of it instead of crowding them all down one flank.
 */
const INITIAL_HABITS: readonly DemoHabit[] = [
  {
    id: "move",
    name: "Move",
    icon: Dumbbell,
    color: "var(--color-habi-tertiary)",
    goal: 3,
    days: [Weekday.monday, Weekday.wednesday, Weekday.friday],
    earlierThisWeek: 1,
    todayCount: 0,
  },
  {
    id: "read",
    name: "Read",
    icon: BookOpen,
    color: "var(--color-habi-on-primary)",
    goal: 7,
    days: [],
    earlierThisWeek: 3,
    todayCount: 1,
  },
  {
    id: "water",
    name: "Water",
    icon: Droplet,
    color: "var(--color-habi-sky)",
    goal: 42,
    days: [],
    earlierThisWeek: 17,
    todayCount: 4,
  },
  {
    id: "practise",
    name: "Practise",
    icon: Music,
    color: "var(--color-habi-secondary)",
    goal: 5,
    days: [Weekday.tuesday, Weekday.thursday, Weekday.saturday],
    earlierThisWeek: 2,
    todayCount: 0,
  },
  {
    id: "tidy",
    name: "Tidy",
    icon: Sparkles,
    color: "var(--color-habi-primary)",
    goal: 10,
    days: [],
    earlierThisWeek: 4,
    todayCount: 2,
  },
];

/** Trims to two decimals, but drops them when the pace is a whole number. */
function formatPace(pace: number): string {
  return Number.isInteger(pace) ? String(pace) : pace.toFixed(2);
}

export function HabitPaceDemo() {
  const [habits, setHabits] = useState<readonly DemoHabit[]>(INITIAL_HABITS);
  const [selectedId, setSelectedId] = useState("water");
  const [dayOfWeek, setDayOfWeek] = useState<WeekdayNumber>(Weekday.thursday);

  const derived = useMemo(
    () =>
      habits.map((habit) => {
        const daysOfWeek = habit.days;
        const expectedPace = computeExpectedPace({
          daysOfWeek,
          goal: habit.goal,
        });
        const paceDays = computePaceDays({
          daysOfWeek,
          dayOfWeek,
          weekMonday: WEEK_MONDAY,
          activatedAt: null,
        });
        const weekCount = habit.earlierThisWeek + habit.todayCount;
        // One params object for both, so "on pace" and the fill it describes
        // can never be computed from different inputs.
        const fill = {
          weekCount,
          expectedPace,
          activeDaysPassedSafe: paceDays.passed,
        };
        return {
          ...habit,
          expectedPace,
          suggestedDailyCount: computeStaticDailyCount({
            daysOfWeek,
            goal: habit.goal,
          }),
          activeDays: daysOfWeek.length === 0 ? 7 : daysOfWeek.length,
          paceDays,
          weekCount,
          innerFill: computeInnerFillFraction(fill),
          onPace: isOnPaceForWeek(fill),
          dayFraction: computeDayCompletionFraction({
            count: habit.todayCount,
            expectedPace,
          }),
        };
      }),
    [habits, dayOfWeek],
  );

  const selected = derived.find((habit) => habit.id === selectedId);
  // Unreachable — `selectedId` only ever comes from this list — but the array
  // lookup is still `T | undefined` under `noUncheckedIndexedAccess`.
  if (!selected) return null;

  const wheelHabits: WheelHabit[] = derived.map((habit) => ({
    id: habit.id,
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    todayCount: habit.todayCount,
    suggestedDailyCount: habit.suggestedDailyCount,
    innerFill: habit.innerFill,
  }));

  function updateSelected(patch: Partial<DemoHabit>) {
    setHabits((current) =>
      current.map((habit) =>
        habit.id === selectedId ? { ...habit, ...patch } : habit,
      ),
    );
  }

  function increment(id: string) {
    setHabits((current) =>
      current.map((habit) => {
        if (habit.id !== id) return habit;
        const sections = computeStaticDailyCount({
          daysOfWeek: habit.days,
          goal: habit.goal,
        });
        // Past the last lap the ring's shade stops changing, so counting higher
        // would look identical — see MAX_LAP_SHADE.
        const ceiling = sections * (MAX_LAP_SHADE + 1);
        return {
          ...habit,
          todayCount: Math.min(habit.todayCount + 1, ceiling),
        };
      }),
    );
  }

  // `selected` is narrowed by the guard above and captured as a const, so no
  // assertion is needed here.
  const selectedDays = selected.days;

  function toggleDay(value: WeekdayNumber) {
    updateSelected({
      days: selectedDays.includes(value)
        ? selectedDays.filter((day) => day !== value)
        : [...selectedDays, value].sort((a, b) => a - b),
    });
  }

  const everyDay = selected.days.length === 0;

  return (
    <div className="border-line bg-surface flex flex-col gap-6 rounded-3xl border p-4 sm:p-6">
      <HabitWheel
        habits={wheelHabits}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onIncrement={increment}
      />

      <p className="text-subtle text-center text-sm">
        Tap a habit to tick it off. The ring is today; the fill inside it is the
        week.
      </p>

      <div className="border-line flex flex-col gap-6 border-t pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-ink text-lg font-bold">{selected.name}</h3>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: selected.onPace
                ? "color-mix(in oklab, var(--color-habi-tertiary) 25%, transparent)"
                : "color-mix(in oklab, var(--color-habi-secondary) 30%, transparent)",
            }}
          >
            {selected.onPace ? "On pace" : "Behind pace"}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <label
            className="text-ink flex items-baseline justify-between gap-3 text-sm font-semibold tracking-wide uppercase"
            htmlFor="demo-goal"
          >
            Weekly goal
            <output className="text-2xl font-bold tracking-normal normal-case">
              {selected.goal}
            </output>
          </label>
          <input
            id="demo-goal"
            className="range-input"
            type="range"
            min={GOAL_MIN}
            max={GOAL_MAX}
            value={selected.goal}
            onChange={(event) =>
              updateSelected({ goal: Number(event.target.value) })
            }
          />
        </div>

        <fieldset className="flex flex-col gap-3 border-0">
          <legend className="text-ink text-sm font-semibold tracking-wide uppercase">
            Scheduled days
          </legend>
          <div className="flex flex-wrap gap-2">
            {DAY_LABELS.map((day) => {
              const active = everyDay || selected.days.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  className="border-line text-subtle aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-on-brand flex-1 basis-12 cursor-pointer rounded-md border bg-transparent px-1 py-2 text-sm font-semibold transition-colors"
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
              : `${selected.activeDays} day${selected.activeDays === 1 ? "" : "s"} a week.`}
          </p>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <label
            className="text-ink text-sm font-semibold tracking-wide uppercase"
            htmlFor="demo-today"
          >
            Today is
          </label>
          <select
            id="demo-today"
            className="border-line text-ink rounded-md border bg-transparent px-3 py-2 text-sm font-semibold"
            value={dayOfWeek}
            onChange={(event) =>
              setDayOfWeek(Number(event.target.value) as WeekdayNumber)
            }
          >
            {DAY_LABELS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.full}
              </option>
            ))}
          </select>
          <span className="text-subtle text-sm">
            {selected.paceDays.passed} of {selected.paceDays.perWeek} active
            days gone
          </span>
        </div>

        <dl className="flex flex-wrap gap-3">
          <Readout
            label="Expected pace"
            value={formatPace(selected.expectedPace)}
            note="per active day"
          />
          <Readout
            label="Suggested daily count"
            value={String(selected.suggestedDailyCount)}
            note={
              selected.suggestedDailyCount === MAX_SUGGESTED_DAILY_COUNT
                ? "capped"
                : "rounded up"
            }
          />
          <Readout
            label="This week"
            value={`${selected.weekCount}/${selected.goal}`}
            note={`today ${formatPace(selected.dayFraction)}×`}
          />
        </dl>
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-canvas flex-1 basis-40 rounded-md p-4">
      <dt className="text-subtle text-xs font-semibold tracking-wider uppercase">
        {label}
      </dt>
      <dd className="text-ink mt-1 flex flex-wrap items-baseline gap-2 text-2xl font-bold tabular-nums">
        {value}
        <span className="text-subtle text-[0.8125rem] font-medium">{note}</span>
      </dd>
    </div>
  );
}
