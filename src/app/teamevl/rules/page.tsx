import type { Metadata } from "next";
import { TeamEvlLinks } from "@/app/teamevl/_components/TeamEvlLinks";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { type Rulebook, rulebooks } from "@/lib/rulebooks";

export const metadata: Metadata = {
  title: "Rules Archive",
  description:
    "Every edition of the Team EvL rules, newest first, as a PDF you can download.",
  alternates: { canonical: "/teamevl/rules" },
};

/**
 * Every edition of the rules, so someone holding an older printing can find the
 * rulebook that matches their box.
 *
 * The list, its order and which edition is current all come from
 * `lib/rulebooks.ts`; this file only lays them out.
 *
 * An `<ol>` rather than a `<div>` stack: the sequence is the information.
 */
export default function Page() {
  return (
    <PageShell
      eyebrow="Team EvL"
      title="Rules Archive"
      lede="Every edition of the rules, newest first. If your copy is an older printing, its rulebook is still here."
    >
      <ol className="flex max-w-[72ch] list-none flex-col gap-4">
        {rulebooks.map((book, index) => (
          <li key={book.version}>
            <RulebookCard book={book} current={index === 0} />
          </li>
        ))}
      </ol>
      <TeamEvlLinks omit="/teamevl/rules" />
    </PageShell>
  );
}

/**
 * One edition. `current` is PASSED rather than recomputed, so the badge cannot
 * disagree with the position on the page.
 *
 * The PDF is off-site, so it is a plain anchor rather than a `Link`.
 */
function RulebookCard({ book, current }: { book: Rulebook; current: boolean }) {
  return (
    <article className="border-line bg-surface flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-ink text-xl font-bold tracking-tight">
            {book.title}
          </h2>
          {current ? (
            <span className="bg-brand text-on-brand rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              Current
            </span>
          ) : null}
        </div>
        {/* Dropped, not rendered empty: a blank `<p>` still takes line height. */}
        {book.note === "" ? null : <p className="text-subtle">{book.note}</p>}
      </div>
      {/*
        The class goes on `Button`, NOT the anchor: tailwind-merge runs through
        `cn()` there, so `h-11` replaces the size variant's height instead of
        racing it in the stylesheet.
      */}
      <Button
        asChild
        size="lg"
        variant={current ? "default" : "outline"}
        className="h-11 shrink-0 self-start rounded-full px-6 font-bold tracking-wide uppercase sm:self-auto"
      >
        <a
          href={book.url}
          target="_blank"
          rel="noreferrer"
          data-analytics-id={`download-rules-${book.version}`}
        >
          {/*
            Every row's button reads "Download PDF", useless to someone listing
            links out of context. The sr-only span names the edition for
            assistive tech; `data-analytics-id` does the same for the reports.
          */}
          <span className="sr-only">{book.title} rules — </span>
          Download PDF
        </a>
      </Button>
    </article>
  );
}
