import Link from "next/link";
import type { Route } from "next";

/**
 * The Habi Sloth section's own support and legal nav.
 *
 * These links live here rather than in the site footer: they govern one
 * product, not the studio. Keeping them inside the section means the App Store
 * and Play Store privacy-policy URLs stay discoverable to a crawler entering
 * anywhere under /habisloth, without the studio shell claiming them site-wide.
 */

const LINKS: ReadonlyArray<{ href: Route; label: string }> = [
  { href: "/habisloth/support", label: "Support" },
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
      aria-label="Habi Sloth support and legal"
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
