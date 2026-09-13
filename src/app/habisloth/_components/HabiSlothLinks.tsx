import Link from "next/link";
import type { Route } from "next";

/**
 * The Habi Sloth section's legal nav. Here rather than in `SiteFooter` because
 * these govern one product, not the studio. Keeps the store-listed privacy URLs
 * crawlable from anywhere under /habisloth without claiming them site-wide.
 */

const LINKS: ReadonlyArray<{ href: Route; label: string }> = [
  { href: "/habisloth/privacy", label: "Privacy Policy" },
  { href: "/habisloth/terms", label: "Terms & Conditions" },
];

interface HabiSlothLinksProps {
  /** Omit the entry for the page currently being rendered. */
  omit?: Route;
}

export function HabiSlothLinks({ omit }: HabiSlothLinksProps) {
  const links = LINKS.filter((item) => item.href !== omit);

  return (
    <nav
      className="border-line mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-sm"
      aria-label="Habi Sloth legal"
    >
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-link underline underline-offset-4"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
