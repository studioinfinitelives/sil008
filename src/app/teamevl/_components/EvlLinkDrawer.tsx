"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { evlLinks } from "@/lib/evlLinks";

/**
 * A pull tab on the right edge of /teamevl that slides out the link list. A
 * shortcut to the same destinations `TeamEvlLinks` carries at the foot of the
 * page, which stays.
 *
 * THE WIDTH APPEARS TWICE and must be changed together: `w-64` on the panel and
 * `translate-x-64` on the strip. Tab and panel slide as one strip so the tab
 * reads as a handle attached to the drawer.
 *
 * The panel is always rendered and hidden by transform rather than unmounted,
 * which is what lets it animate. `inert` is what makes that safe: while closed
 * it takes the links out of the tab order and the accessibility tree, so nobody
 * can land inside a drawer they cannot see.
 *
 * Non-modal: the page behind stays scrollable, so there is no focus trap.
 * Escape, the tab, a click away, and following a link all close it.
 */

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
        Click-away catcher. A `<button>` so the handler sits on something meant
        to be clicked; `tabIndex={-1}` plus `aria-hidden` keep it out of the tab
        order and the accessibility tree, where a full-screen "close" control
        would be noise. Escape is the keyboard equivalent.
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
            `vertical-rl` alone runs top-to-bottom with the glyphs on their
            right side, the wrong rotation for a Latin label on this tab. Hence
            the extra `rotate-180`.
          */}
          <span className="rotate-180 text-xs font-bold tracking-widest uppercase [writing-mode:vertical-rl]">
            Looking for Me?
          </span>
        </button>

        <nav
          id={panelId}
          inert={!open}
          // Must differ from `TeamEvlLinks`'s "Team EvL links": two identically
          // named landmarks are indistinguishable in a landmark list.
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
