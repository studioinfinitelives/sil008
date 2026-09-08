import type { Metadata } from "next";
import { LegalDocumentBody } from "@/components/LegalDocument";
import { PageShell } from "@/components/PageShell";
import { SITE_LEGAL_VERSION, loadLocalLegalDocument } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy and Cookies",
  description:
    "How infinitelives.io uses cookies and analytics, and how to change your choice.",
  alternates: { canonical: "/privacy" },
};

/**
 * The studio's own privacy and cookie notice.
 *
 * Separate from `/habisloth/privacy` on purpose: that document governs the app,
 * and a Team EvL visitor reading it would be told about accounts and offline
 * data that have nothing to do with this site. It is also what the cookie
 * banner's "Learn more" points at, so it has to describe *this* site's cookies.
 *
 * Unlike the Habi Sloth documents this one has no upstream to mirror — the
 * markdown is committed here and read straight off disk at build time.
 */
export default async function Page() {
  const document = await loadLocalLegalDocument(
    "site-privacy.md",
    SITE_LEGAL_VERSION,
  );

  return (
    <PageShell
      eyebrow="Studio Infinite Lives"
      title={document.title}
      lede={`Effective ${document.effectiveDate} — version ${document.version}.`}
    >
      <LegalDocumentBody document={document} />
    </PageShell>
  );
}
