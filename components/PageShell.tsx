import type { ReactNode } from "react";

interface PageShellProps {
  /** Small label above the title — usually the section name. */
  eyebrow?: string;
  title: string;
  /** Optional standfirst under the title. */
  lede?: string;
  children?: ReactNode;
}

/**
 * The common page frame: centred measure, section eyebrow, title, body.
 *
 * Styled only through the semantic tokens in globals.css, so a page renders in
 * whichever brand its route subtree is scoped to.
 */
export function PageShell({ eyebrow, title, lede, children }: PageShellProps) {
  return (
    <main className="bg-canvas flex-1">
      <div className="mx-auto max-w-6xl px-5 py-14">
        {eyebrow ? (
          <span className="bg-brand text-on-brand mb-3 inline-block rounded-full px-5 py-2 text-xs font-semibold tracking-wider uppercase">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {lede ? (
          <p className="text-subtle mt-5 max-w-[68ch] text-lg">{lede}</p>
        ) : null}
        {children ? (
          <div className="mt-8 flex flex-col gap-5">{children}</div>
        ) : null}
      </div>
    </main>
  );
}
