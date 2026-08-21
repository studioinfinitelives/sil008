import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Terms of Use" };

// Placeholder route — real content lands in plan §5.
export default function Page() {
  return (
    <PageShell
      eyebrow="Habi Sloth"
      title="Terms of Use"
      lede="Placeholder. Content for this page is plan §5."
    />
  );
}
