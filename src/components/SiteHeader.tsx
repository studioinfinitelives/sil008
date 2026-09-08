import Link from "next/link";
import type { Route } from "next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_NAME } from "@/lib/site";

/**
 * Site-wide masthead: wordmark home, section nav, theme switch.
 *
 * A server component — only {@link ThemeToggle} inside it needs the client, so
 * the nav itself costs no JavaScript. The links are plain `<Link>`s, which with
 * `typedRoutes` on means a typo in any path below fails `tsc` rather than
 * shipping a dead link.
 */

const NAV: ReadonlyArray<{ href: Route; label: string }> = [
  { href: "/teamevl", label: "Team EvL" },
  { href: "/habisloth", label: "Habi Sloth" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  return (
    <header className="border-line bg-canvas/80 sticky top-0 z-50 border-b backdrop-blur">
      <nav
        className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="text-ink hover:text-link mr-auto text-sm font-bold tracking-wide transition-colors"
        >
          {SITE_NAME}
        </Link>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-subtle hover:text-ink text-sm font-medium transition-colors"
          >
            {item.label}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}
