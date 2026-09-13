import Link from "next/link";
import { CookiePreferencesButton } from "@/components/CookiePreferencesButton";
import { SITE_NAME } from "@/lib/site";

/**
 * Site-wide footer: copyright, the studio's own privacy notice, and the way
 * back into the cookie dialog.
 *
 * Per-product legal documents are deliberately NOT listed here. Each product
 * links its own from its own section, so the studio shell never implies one
 * product's terms govern another's.
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
