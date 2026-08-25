import Link from "next/link";
import type { Route } from "next";
import { SITE_NAME } from "@/lib/site";

/**
 * Site-wide footer.
 *
 * Deliberately thin. Per-product legal documents are **not** listed here —
 * each product links its own privacy policy and terms from its own section, so
 * the studio shell never implies that one product's terms govern another's.
 * The studio contact address lives on the hub under "Contact", and is not
 * repeated here.
 */

const LINKS: ReadonlyArray<{ href: Route; label: string }> = [
  { href: "/habisloth/support", label: "Support" },
];

export function SiteFooter() {
  return (
    <footer className="border-line bg-canvas border-t">
      <div className="text-subtle mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-8 text-sm">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}, LLC
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Secondary">
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
