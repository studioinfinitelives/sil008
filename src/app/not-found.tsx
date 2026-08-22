import Link from "next/link";
import { PageShell } from "@/components/PageShell";

/**
 * Branded 404.
 *
 * Under `output: "export"` this renders to `out/404.html`, which is the exact
 * filename Firebase Hosting serves for unmatched paths — so no hosting config
 * is needed to wire it up. Without this file that page is Next's unstyled
 * default, sitting outside the site's own typography and palette.
 */
export default function NotFound() {
  return (
    <PageShell
      eyebrow="404"
      title="That page doesn't exist."
      lede="The link may be out of date, or the page may have moved."
    >
      <Link className="text-link underline underline-offset-2" href="/">
        Back to the studio
      </Link>
    </PageShell>
  );
}
