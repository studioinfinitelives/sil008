import Link from "next/link";
import { CookiePreferencesButton } from "@/components/CookiePreferencesButton";
import { SITE_NAME } from "@/lib/site";

/**
 * Site-wide footer.
 *
 * Deliberately thin: a copyright line, the studio's privacy notice, and the way
 * back into the cookie dialog. The privacy link belongs here precisely because
 * that document governs the whole site — how *this* site uses cookies and
 * analytics. Per-product legal documents still are **not** listed here: each
 * product links its own privacy policy and terms from its own section, so the
 * studio shell never implies that one product's terms govern another's. The
 * studio contact address lives on the hub under "Contact", and is not repeated
 * here.
 */
export function SiteFooter() {
  return (
    <footer className="border-line bg-canvas border-t">
      <div className="text-subtle mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-8 text-sm">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}, LLC
        </p>
        <Link href="/privacy" className="text-subtle hover:text-ink">
          Privacy
        </Link>
        <CookiePreferencesButton />
      </div>
    </footer>
  );
}
