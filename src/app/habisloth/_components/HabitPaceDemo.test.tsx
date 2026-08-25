import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { HabitPaceDemo } from "./HabitPaceDemo";

/**
 * These assert what the user reads, not internal state — the point of the
 * component is that it reports what `lib/habits.ts` computes, so the numbers on
 * screen are the contract.
 *
 * Inherited from the PaceCalculator this replaces, plus the wheel's own
 * behaviour. The seed habit is Water: a goal of 42 every day, 17 done earlier
 * in the week and 4 today.
 */

function readResult(label: string): string {
  const term = screen.getByText(label);
  const value = term.parentElement?.querySelector("dd");
  return value?.textContent ?? "";
}

function scheduleGroup(): HTMLElement {
  return screen.getByRole("group", { name: /scheduled days/i });
}

describe("HabitPaceDemo", () => {
  test("defaults to every day, so a goal of 42 spreads over 7", () => {
    render(<HabitPaceDemo />);
    expect(screen.getByText(/runs every day/i)).toBeInTheDocument();
    expect(readResult("Expected pace")).toContain("6");
    expect(readResult("Suggested daily count")).toContain("6");
  });

  test("whole-number paces drop the decimals", () => {
    render(<HabitPaceDemo />);
    // 42 / 7 is exactly 6, not "6.00".
    expect(readResult("Expected pace")).not.toContain("6.00");
  });

  test("picking days changes the divisor", async () => {
    const user = userEvent.setup();
    render(<HabitPaceDemo />);

    for (const day of ["Monday", "Wednesday", "Friday"]) {
      await user.click(
        within(scheduleGroup()).getByRole("button", { name: day }),
      );
    }

    expect(screen.getByText(/3 days a week/i)).toBeInTheDocument();
    // 42 / 3 = 14.
    expect(readResult("Expected pace")).toContain("14");
    expect(readResult("Suggested daily count")).toContain("14");
  });

  test("a fractional pace keeps two decimals", async () => {
    const user = userEvent.setup();
    render(<HabitPaceDemo />);

    for (const day of ["Monday", "Tuesday", "Wednesday", "Thursday"]) {
      await user.click(
        within(scheduleGroup()).getByRole("button", { name: day }),
      );
    }

    // 42 / 4 = 10.5, and it rounds up to 11 a day.
    expect(readResult("Expected pace")).toContain("10.50");
    expect(readResult("Suggested daily count")).toContain("11");
  });

  test("deselecting the last day falls back to every day", async () => {
    const user = userEvent.setup();
    render(<HabitPaceDemo />);

    const monday = within(scheduleGroup()).getByRole("button", {
      name: "Monday",
    });
    await user.click(monday); // only Monday
    expect(screen.getByText(/1 day a week/i)).toBeInTheDocument();

    await user.click(monday); // none — back to the every-day default
    expect(screen.getByText(/runs every day/i)).toBeInTheDocument();
  });

  test("every day is shown as selected when none are picked", () => {
    render(<HabitPaceDemo />);
    for (const button of within(scheduleGroup()).getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-pressed", "true");
    }
  });

  test("tapping a habit on the wheel ticks it off", async () => {
    const user = userEvent.setup();
    render(<HabitPaceDemo />);

    expect(readResult("This week")).toContain("21/42");
    await user.click(screen.getByRole("button", { name: /^Water, 4 of 6/ }));

    expect(readResult("This week")).toContain("22/42");
    // The button re-announces its own new count.
    expect(
      screen.getByRole("button", { name: /^Water, 5 of 6/ }),
    ).toBeInTheDocument();
  });

  test("the wheel is keyboard operable", async () => {
    const user = userEvent.setup();
    render(<HabitPaceDemo />);

    const water = screen.getByRole("button", { name: /^Water, 4 of 6/ });
    water.focus();
    await user.keyboard("{Enter}");

    expect(readResult("This week")).toContain("22/42");
  });

  test("tapping a different habit hands the controls to it", async () => {
    const user = userEvent.setup();
    render(<HabitPaceDemo />);

    expect(screen.getByRole("heading", { name: "Water" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Move,/ }));

    expect(screen.getByRole("heading", { name: "Move" })).toBeInTheDocument();
    // Move's own goal is 3 across three days, so one a day.
    expect(readResult("Expected pace")).toContain("1");
    expect(screen.getByText(/3 days a week/i)).toBeInTheDocument();
  });

  test("reports whether the week is on pace", async () => {
    const user = userEvent.setup();
    render(<HabitPaceDemo />);

    // 21 done by Thursday against 4 active days at 6 a day is behind.
    expect(screen.getByText("Behind pace")).toBeInTheDocument();

    // Earlier in the week, the same 21 is comfortably ahead.
    await user.selectOptions(
      screen.getByLabelText(/today is/i),
      screen.getByRole("option", { name: "Monday" }),
    );
    expect(screen.getByText("On pace")).toBeInTheDocument();
  });

  test("moving through the week changes how many active days have gone", async () => {
    const user = userEvent.setup();
    render(<HabitPaceDemo />);

    expect(screen.getByText(/4 of 7 active days gone/i)).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText(/today is/i),
      screen.getByRole("option", { name: "Sunday" }),
    );
    expect(screen.getByText(/7 of 7 active days gone/i)).toBeInTheDocument();
  });
});
