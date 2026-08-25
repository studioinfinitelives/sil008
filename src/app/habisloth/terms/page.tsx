import type { Metadata } from "next";
import { HabiSlothLinks } from "@/app/habisloth/_components/HabiSlothLinks";
import { LegalDocumentBody } from "@/components/LegalDocument";
import { PageShell } from "@/components/PageShell";
import { loadLegalDocument } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The agreement between you and Studio Infinite Lives, LLC covering your use of Habi Sloth.",
  alternates: { canonical: "/habisloth/terms" },
};

/**
 * The canonical terms URL. Body fetched from habisloth.app at build time so it
 * matches the copy the app asks users to accept — see `lib/legal.ts`.
 */
export default async function Page() {
  const document = await loadLegalDocument("terms");

  return (
    <PageShell
      eyebrow="Habi Sloth"
      title={document.title}
      lede={`Effective ${document.effectiveDate} — version ${document.version}.`}
    >
      <LegalDocumentBody document={document} />
      <HabiSlothLinks omit="/habisloth/terms" />
    </PageShell>
  );
}
