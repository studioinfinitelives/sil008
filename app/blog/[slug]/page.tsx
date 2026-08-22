import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Post" };

// Placeholder route — MDX-backed posts land in plan §3.
// `output: 'export'` requires every dynamic route be enumerated at build time.
export function generateStaticParams(): Array<{ slug: string }> {
  return [{ slug: "hello-world" }];
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PageShell eyebrow="Infinite Lives" title={slug} lede="Placeholder post." />
  );
}
