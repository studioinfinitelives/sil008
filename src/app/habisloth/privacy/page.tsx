import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/habisloth/privacy" },
};

// Placeholder route — real content lands in plan §5.
export default function Page() {
  return (
    <PageShell
      eyebrow="Habi Sloth"
      title="Privacy Policy"
      lede="Placeholder. Content for this page is plan §5."
    />
  );
}
