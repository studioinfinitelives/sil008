import Link from "next/link";
import type { Route } from "next";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

/**
 * Site-wide footer.
 *
 * The Habi Sloth legal links are not decoration: the App Store and Play Store
 * listings both require a reachable privacy-policy URL, and account deletion
 * needs a public explainer. Surfacing them on every page means those URLs stay
 * discoverable regardless of where a crawler or reviewer enters the site.
 */

const LEGAL: ReadonlyArray<{ href: Route; label: string }> = [
  { href: "/habisloth/support", label: "Support" },
  { href: "/habisloth/privacy", label: "Privacy" },
  { href: "/habisloth/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-line bg-canvas border-t">
      <div className="text-subtle mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-8 text-sm">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}, LLC
        </p>
        <nav
          className="flex flex-wrap gap-x-6 gap-y-3"
          aria-label="Legal and support"
        >
          {LEGAL.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          className="text-link ml-auto underline underline-offset-2"
          href={`mailto:${CONTACT_EMAIL}`}
        >
          {CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  );
}
