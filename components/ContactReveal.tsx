"use client";

import { useState } from "react";
import styles from "./ContactReveal.module.css";

const CONTACT_EMAIL = "hello@infinitelives.io";

/**
 * "Contact us" that swaps for the address on click, mirroring the behaviour of
 * the site this replaces.
 *
 * A client component purely for the `useState` toggle — it is the only
 * interactive element on an otherwise fully static hub page, which makes it a
 * small, honest demonstration of the server/client boundary.
 */
export function ContactReveal() {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return (
      <a className={styles.email} href={`mailto:${CONTACT_EMAIL}`}>
        {CONTACT_EMAIL}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={styles.reveal}
      onClick={() => setRevealed(true)}
    >
      Contact us
    </button>
  );
}
