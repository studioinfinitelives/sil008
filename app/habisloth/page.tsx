import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Habi Sloth" };

// Placeholder route — real content lands in plan §3.
export default function Page() {
  return (
    <PageShell
      eyebrow="Habi Sloth"
      title="Habi Sloth"
      lede="Placeholder. Content for this page is plan §3."
    />
  );
}
