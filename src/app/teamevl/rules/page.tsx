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
 * Every edition of the rules, newest first.
 *
 * This exists because a printed game outlives its rulebook: someone at a table
 * with the first Game Crafter box needs the rules that match it, not the ones
 * currently selling. The Linktree used to answer that with a Google Drive
 * folder, which interstitials the download and can ask a stranger to sign in —
 * these are the studio's own copies, on the studio's own CDN.
 *
 * The list itself, its order, and which edition is current all come from
 * `lib/rulebooks.ts`; this file only lays them out.
 *
 * An `<ol>` rather than a `<div>` stack: the sequence is the information, and a
 * screen reader should announce it as the ordered list it is.
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
 * One edition: what it is called, who it is for, and the download.
 *
 * `current` is passed rather than recomputed so the badge cannot disagree with
 * the position on the page — the top row is the current edition by definition
 * (see `currentRulebook`).
 *
 * The PDF is off-site (the studio's CDN, not this export), so it is a plain
 * anchor opening in a new tab, the same as the rulebook button on /teamevl.
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
        {/* Dropped rather than rendered empty — a blank `<p>` still takes a
            line's height, which reads as a gap under the title. */}
        {book.note === "" ? null : <p className="text-subtle">{book.note}</p>}
      </div>
      {/*
        The class goes on the `Button`, not the anchor: it is merged through
        `cn()`/tailwind-merge there, so `h-11` actually replaces the size
        variant's height instead of racing it in the stylesheet.
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
            Every row's button reads "Download PDF", which is no use to someone
            listing the links out of context — the edition is announced first
            and shown to nobody. `data-analytics-id` does the same job for the
            analytics reports, which would otherwise get one anonymous count.
          */}
          <span className="sr-only">{book.title} rules — </span>
          Download PDF
        </a>
      </Button>
    </article>
  );
}
