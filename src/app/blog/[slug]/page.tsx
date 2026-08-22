import { PageShell } from "@/components/PageShell";

// Placeholder route — MDX-backed posts land in plan §3.
// `output: 'export'` requires every dynamic route be enumerated at build time.
export function generateStaticParams(): Array<{ slug: string }> {
  return [{ slug: "hello-world" }];
}

// Metadata is per-post, so it has to be generated rather than a static object.
export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  return { title: slug, alternates: { canonical: `/blog/${slug}` } };
}

export default async function Page({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  return (
    <PageShell eyebrow="Infinite Lives" title={slug} lede="Placeholder post." />
  );
}
