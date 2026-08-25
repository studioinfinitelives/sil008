import type { Metadata } from "next";
import { HabiSlothLinks } from "@/app/habisloth/_components/HabiSlothLinks";
import { LegalDocumentBody } from "@/components/LegalDocument";
import { PageShell } from "@/components/PageShell";
import { loadLegalDocument } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Habi Sloth collects, uses and stores your information, and what choices you have.",
  alternates: { canonical: "/habisloth/privacy" },
};

/**
 * The canonical privacy-policy URL.
 *
 * App Store and Play Store listings should point here directly rather than at
 * a redirect. The body is fetched from habisloth.app at build time so it can
 * never drift from what the app itself shows — see `lib/legal.ts`.
 */
export default async function Page() {
  const document = await loadLegalDocument("privacy");

  return (
    <PageShell
      eyebrow="Habi Sloth"
      title={document.title}
      lede={`Effective ${document.effectiveDate} — version ${document.version}.`}
    >
      <LegalDocumentBody document={document} />
      <HabiSlothLinks omit="/habisloth/privacy" />
    </PageShell>
  );
}
