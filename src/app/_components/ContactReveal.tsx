"use client";

import { useState } from "react";
import { CONTACT_EMAIL } from "@/lib/site";

/**
 * "Contact us" that swaps for the address on click, mirroring the behaviour of
 * the site this replaces.
 *
 * A client component purely for the `useState` toggle — the only interactive
 * element on an otherwise fully static hub page.
 */
export function ContactReveal() {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return (
      <a
        className="text-link text-base font-medium underline underline-offset-2"
        href={`mailto:${CONTACT_EMAIL}`}
      >
        {CONTACT_EMAIL}
      </a>
    );
  }

  return (
    <button
      type="button"
      className="text-link cursor-pointer text-sm font-medium underline underline-offset-2"
      onClick={() => setRevealed(true)}
    >
      Contact us
    </button>
  );
}
