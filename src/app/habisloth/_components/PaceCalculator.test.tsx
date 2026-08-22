import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { PaceCalculator } from "./PaceCalculator";

/**
 * These assert what the user reads, not internal state — the point of the
 * component is that it reports what `lib/habits.ts` computes, so the numbers on
 * screen are the contract.
 */

function readResult(label: string): string {
  const term = screen.getByText(label);
  const value = term.parentElement?.querySelector("dd");
  return value?.textContent ?? "";
}

describe("PaceCalculator", () => {
  test("defaults to every day, so a goal of 5 spreads over 7", () => {
    render(<PaceCalculator />);
    expect(screen.getByText(/runs every day/i)).toBeInTheDocument();
    // 5 / 7 = 0.71…, rounded up to 1 a day.
    expect(readResult("Expected pace")).toContain("0.71");
    expect(readResult("Suggested daily count")).toContain("1");
  });

  test("picking days changes the divisor", async () => {
    const user = userEvent.setup();
    render(<PaceCalculator />);

    for (const day of ["Monday", "Wednesday", "Friday"]) {
      await user.click(screen.getByRole("button", { name: day }));
    }

    expect(screen.getByText(/3 days a week/i)).toBeInTheDocument();
    // 5 / 3 = 1.67, which rounds up to 2.
    expect(readResult("Expected pace")).toContain("1.67");
    expect(readResult("Suggested daily count")).toContain("2");
  });

  test("deselecting the last day falls back to every day", async () => {
    const user = userEvent.setup();
    render(<PaceCalculator />);

    const monday = screen.getByRole("button", { name: "Monday" });
    await user.click(monday); // only Monday
    expect(screen.getByText(/1 day a week/i)).toBeInTheDocument();

    await user.click(monday); // none — back to the every-day default
    expect(screen.getByText(/runs every day/i)).toBeInTheDocument();
  });

  test("whole-number paces drop the decimals", async () => {
    const user = userEvent.setup();
    render(<PaceCalculator />);

    await user.click(screen.getByRole("button", { name: "Monday" }));
    // goal 5 over a single day is exactly 5, not "5.00".
    const pace = readResult("Expected pace");
    expect(pace).toContain("5");
    expect(pace).not.toContain("5.00");
  });

  test("every day is shown as selected when none are picked", () => {
    render(<PaceCalculator />);
    const group = screen.getByRole("group");
    for (const button of within(group).getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-pressed", "true");
    }
  });
});
