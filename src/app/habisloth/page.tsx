import type { Metadata } from "next";
import { HabiSlothLinks } from "@/app/habisloth/_components/HabiSlothLinks";
import { PaceCalculator } from "@/app/habisloth/_components/PaceCalculator";
import { PageShell } from "@/components/PageShell";

const DESCRIPTION =
  "A habit tracking app for the easy going. Set a weekly goal and Habi Sloth works out the daily pace.";

export const metadata: Metadata = {
  title: "Habi Sloth",
  description: DESCRIPTION,
  alternates: { canonical: "/habisloth" },
  // Overrides the studio defaults inherited from the root layout; the OG image
  // itself is picked up automatically from this segment's `opengraph-image`.
  openGraph: {
    title: "Habi Sloth",
    description: DESCRIPTION,
    url: "/habisloth",
  },
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
      <HabiSlothLinks omit="/habisloth" />
    </PageShell>
  );
}
