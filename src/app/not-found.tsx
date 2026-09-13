import Link from "next/link";
import { PageShell } from "@/components/PageShell";

/**
 * Branded 404. Renders to `out/404.html`, the exact filename Firebase Hosting
 * serves for unmatched paths, so no hosting config is needed to wire it up.
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
