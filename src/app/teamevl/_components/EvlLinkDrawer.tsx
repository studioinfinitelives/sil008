"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { evlLinks } from "@/lib/evlLinks";

/**
 * A pull tab on the right edge of /teamevl that slides out the link list.
 *
 * The same destinations run along the bottom of the page, but that nav is six
 * screens down from the hero — this puts the store, the rules and the Discord
 * one click away wherever the reader has got to. The bottom nav stays: this is
 * a shortcut to it, not a replacement.
 *
 * **The tab and the panel slide together**, as one strip translated by the
 * panel's own width, so the tab reads as the handle physically attached to the
 * drawer rather than a button that happens to sit beside it. That is why the
 * width appears twice — `w-64` on the panel and `translate-x-64` on the strip —
 * and the two must be changed together.
 *
 * The panel is always rendered and hidden by transform rather than unmounted,
 * which is what lets it animate. `inert` is what makes that safe: while closed
 * it takes the links out of the tab order and out of the accessibility tree,
 * so a keyboard or screen-reader user cannot land inside a drawer they cannot
 * see, and the drawer's nav landmark is only announced while it is open.
 *
 * Non-modal by design — the page behind stays scrollable and readable, so there
 * is no focus trap. Escape, the tab itself, a click anywhere off it, and
 * following any link all close it.
 */

/** Kept for the pull tab, which is thin enough to swallow a stray tap. */
const TAB_CLASS =
  "bg-brand text-on-brand flex cursor-pointer flex-col items-center gap-2 self-center rounded-l-xl py-5 pr-1.5 pl-2 shadow-lg transition-colors";

const LINK_CLASS =
  "text-link hover:bg-surface-alt rounded-md px-2 py-1.5 text-sm underline underline-offset-4";

export function EvlLinkDrawer() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/*
        The click-away catcher. A `<button>` rather than a bare `<div>` so the
        click handler sits on something that is meant to be clicked, and
        `tabIndex={-1}` with `aria-hidden` keeps it out of the tab order and out
        of the accessibility tree — Escape is the keyboard equivalent, and a
        full-screen "close" control announced to a screen reader is noise.
      */}
      {open ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="fixed inset-0 z-30 cursor-default"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div
        className={`fixed top-1/2 right-0 z-40 flex -translate-y-1/2 items-stretch transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-64"
        }`}
      >
        <button
          type="button"
          className={TAB_CLASS}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        >
          <ChevronLeft
            aria-hidden="true"
            className={`size-4 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
          {/*
            Vertical text, reading bottom-to-top: `vertical-rl` alone runs it
            top-to-bottom with the glyphs on their right side, which is the
            wrong rotation for a Latin label on a left-hand tab.
          */}
          <span className="rotate-180 text-xs font-bold tracking-widest uppercase [writing-mode:vertical-rl]">
            Looking for Me?
          </span>
        </button>

        <nav
          id={panelId}
          inert={!open}
          // Distinct from the nav that closes the page, which carries the same
          // links under "Team EvL links" — two identically named landmarks
          // would be indistinguishable in a landmark list.
          aria-label="Team EvL links drawer"
          className="border-line bg-surface flex w-64 flex-col gap-1 rounded-l-xl border-y border-l p-4 shadow-lg"
        >
          {evlLinks.map((item) =>
            item.kind === "route" ? (
              <Link
                key={item.href}
                href={item.href}
                className={LINK_CLASS}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={LINK_CLASS}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ),
          )}
        </nav>
      </div>
    </>
  );
}
