import type { Metadata } from "next";
import { PaceCalculator } from "@/components/PaceCalculator";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Habi Sloth",
  description:
    "A habit tracking app for the easy going. Set a weekly goal and Habi Sloth works out the daily pace.",
};

// Hero copy, feature list and screenshots are still plan §3; the calculator
// below is the real thing, running the app's own pace math.
export default function Page() {
  return (
    <PageShell
      eyebrow="Habi Sloth"
      title="A Habit Tracking App for the Easy Going."
      lede="Set a goal for the week. Habi Sloth works out what that means today — and whether you are on pace."
    >
      <h2 className="text-2xl font-bold">Try the pace maths</h2>
      <PaceCalculator />
    </PageShell>
  );
}
