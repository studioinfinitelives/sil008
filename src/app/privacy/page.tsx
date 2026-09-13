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
 * The studio's own privacy and cookie notice. Separate from
 * `/habisloth/privacy`, which governs the app. This is what the cookie banner's
 * "Learn more" points at, so it must describe THIS site's cookies.
 *
 * No upstream to mirror: the markdown is committed and read off disk at build.
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
