import Link from "next/link";
import type { Route } from "next";
import { evlLinksExcept } from "@/lib/evlLinks";

/**
 * The Team EvL destinations as the nav that closes a page. The list lives in
 * `lib/evlLinks.ts`, since `EvlLinkDrawer` renders the same entries.
 */

interface TeamEvlLinksProps {
  /** Omit the entry for the page currently being rendered. */
  omit?: Route;
}

const LINK_CLASS = "text-link underline underline-offset-4";

export function TeamEvlLinks({ omit }: TeamEvlLinksProps) {
  return (
    <nav
      className="border-line mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-sm"
      aria-label="Team EvL links"
    >
      {evlLinksExcept(omit).map((item) =>
        item.kind === "route" ? (
          <Link key={item.href} href={item.href} className={LINK_CLASS}>
            {item.label}
          </Link>
        ) : (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className={LINK_CLASS}
          >
            {item.label}
          </a>
        ),
      )}
    </nav>
  );
}
