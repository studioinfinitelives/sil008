import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Blog",
  alternates: { canonical: "/blog" },
};

// Placeholder route — real content lands in plan §3.
export default function Page() {
  return (
    <PageShell
      eyebrow="Infinite Lives"
      title="Blog"
      lede="Placeholder. Content for this page is plan §3."
    />
  );
}
